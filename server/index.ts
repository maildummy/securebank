import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { json } from "body-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import fs from "fs/promises";
import path from "path";

const app = express();
const port = process.env.PORT || 3001;

// Apply helmet middleware for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP to avoid errors
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize default admin user and ensure messages.json exists
async function initializeData() {
  const dataDir = path.join(process.cwd(), "data");
  const usersFile = path.join(dataDir, "users.json");
  const messagesFile = path.join(dataDir, "messages.json");
  
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  try {
    await fs.access(usersFile);
  } catch {
    // Create default admin user
    const bcrypt = await import("bcrypt");
    const defaultAdmin = {
      id: 1,
      username: "admin",
      email: "admin@securebank.com",
      password: await bcrypt.hash("admin123", 10),
      firstName: "Admin",
      lastName: "User",
      status: "approved",
      isAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await fs.writeFile(usersFile, JSON.stringify([defaultAdmin], null, 2));
    log("✅ Default admin user created: admin@securebank.com / admin123");
  }

  // Ensure messages.json exists
  try {
    await fs.access(messagesFile);
    // Check if file is empty or not valid JSON
    const content = await fs.readFile(messagesFile, 'utf-8');
    try {
      const messages = JSON.parse(content);
      if (!Array.isArray(messages)) {
        throw new Error('Messages file is not an array');
      }
    } catch (e) {
      // If not valid JSON, create empty array
      await fs.writeFile(messagesFile, JSON.stringify([], null, 2));
      log("✅ Reset messages.json to empty array");
    }
  } catch {
    // Create empty messages file
    await fs.writeFile(messagesFile, JSON.stringify([], null, 2));
    log("✅ Created empty messages.json file");
  }
}

(async () => {
  await initializeData();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
