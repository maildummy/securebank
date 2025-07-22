import express from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";
import fs from "fs";
import path from "path";
import { writeFile, readFile } from "fs/promises";

// Import storage for user operations
import { storage } from "./storage";

// Helper function to read JSON file
const readJSONFile = async <T>(filename: string, defaultValue: T): Promise<T> => {
  const filePath = path.join(process.cwd(), "data", filename);
  try {
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

// Helper function to write JSON file
const writeJSONFile = async <T>(filename: string, data: T): Promise<void> => {
  const filePath = path.join(process.cwd(), "data", filename);
  await writeFile(filePath, JSON.stringify(data, null, 2));
};

// Ensure that the messages file exists with welcome message
const ensureMessagesFile = async () => {
  const messagesPath = path.join(process.cwd(), "data", "messages.json");
  
  try {
    if (!fs.existsSync(messagesPath)) {
      // Create empty messages file
      await writeJSONFile("messages.json", []);
      console.log("Created empty messages.json file");
    }
    
    // Check if messages file is empty and add welcome message if needed
    const messages = await readJSONFile<any[]>("messages.json", []);
    if (messages.length === 0) {
      console.log("Adding welcome messages for existing users");
      // Add welcome message for each existing user
      const users = await readJSONFile<any[]>("users.json", []);
      const adminUser = users.find(u => u.isAdmin);
      
      if (adminUser && users.length > 0) {
        const welcomeMessages = users
          .filter(user => !user.isAdmin)
          .map(user => ({
            id: `welcome-${user.id}`,
            senderId: adminUser.id,
            receiverId: user.id,
            content: "Welcome to SecureBank! If you have any questions or need assistance, feel free to message us here.",
            timestamp: new Date().toISOString(),
            read: false
          }));
        
        if (welcomeMessages.length > 0) {
          await writeJSONFile("messages.json", welcomeMessages);
          console.log(`Added ${welcomeMessages.length} welcome messages`);
        }
      }
    }
  } catch (error) {
    console.error("Error ensuring messages file:", error);
  }
};

const initializeData = async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log("Created data directory");
    }

    // Initialize files if they don't exist
    const files = ["users.json", "sessions.json", "notifications.json", "creditCards.json"];
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        await writeJSONFile(file, []);
        console.log(`Created empty ${file} file`);
      }
    }

    // Ensure messages file has welcome messages
    await ensureMessagesFile();
    
    console.log("Data initialization complete");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

async function main() {
  await initializeData();
  
  const app = express();
  
  // Basic CORS setup - Accept all origins
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // Disable all security features to avoid browser warnings
  // This is for educational/demo purposes only
  app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    dnsPrefetchControl: false,
    frameguard: false,
    hidePoweredBy: false,
    hsts: false,
    ieNoOpen: false,
    noSniff: false,
    originAgentCluster: false,
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
    xssFilter: false
  }));
  
  // Add trusted headers to tell browsers this site is safe
  app.use((req, res, next) => {
    res.setHeader('X-Safe-Site', 'true');
    res.setHeader('X-Educational-Demo', 'true');
    res.setHeader('X-Phishing-Status', 'not-phishing');
    next();
  });
  
  // Middleware to enforce HTTPS in production but with exceptions
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      // Allow all HTTP traffic during development and testing
      if (req.headers['x-forwarded-proto'] === 'http' && process.env.ALLOW_HTTP !== 'true') {
        // Special cases for verification paths
        if (req.path.includes('/.well-known/') || 
            req.path === '/robots.txt' || 
            req.path === '/sitemap.xml') {
          return next();
        }
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  app.use(express.json());

  // Set up API routes
  await registerRoutes(app);

  // Serve static frontend assets in production
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  }

  // Determine port (use environment variable for deployment platforms)
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Helmet security policies: DISABLED FOR EDUCATIONAL PURPOSES`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API URL: http://localhost:${port}`);
    }
  });
}

main().catch(console.error);
