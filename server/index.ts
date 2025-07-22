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
import bcrypt from "bcryptjs"; // For secure password hashing

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

    // Create default admin account if it doesn't exist
    const users = await readJSONFile<any[]>("users.json", []);
    if (!users.some(u => u.isAdmin)) {
      const adminUser = {
        id: "admin-1",
        username: "Jude_Ogwu.U",
        email: "admin@securebank.demo",
        // Store hashed password for admin
        password: await bcrypt.hash("Jude_O.U@2000", 10),
        isAdmin: true,
        approved: true,
        suspended: false,
        createdAt: new Date().toISOString()
      };
      await writeJSONFile("users.json", [...users, adminUser]);
      console.log("Created default admin account");
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
  
  // Configure CORS - Only allow specific origins in production
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://ss-bank.onrender.com', 'https://bank-demo.onrender.com']
      : '*',
    credentials: true
  }));

  // Configure security headers - balanced approach
  app.use(
    helmet({
      // Enable basic protections but disable ones causing issues
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
      // Keep these enabled for security while disabling problematic ones
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: {
        maxAge: 15552000, // 180 days
        includeSubDomains: true,
      }
    })
  );
  
  // Add educational demo headers
  app.use((req, res, next) => {
    // Educational demo headers
    res.setHeader('X-Educational-Demo', 'true');
    res.setHeader('X-Demo-Purpose', 'SecureBank is an educational demo project');
    
    // Important security headers we're keeping
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Signal this is not a phishing site
    res.setHeader('X-Demo-Notice', 'This is an educational banking application demo');
    
    next();
  });
  
  // Middleware to enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        // Special case for verification endpoints
        if (req.path.includes('/.well-known/') || 
            req.path === '/robots.txt' || 
            req.path === '/sitemap.xml' ||
            req.path === '/security.txt') {
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

  // Add security.txt route
  app.get('/.well-known/security.txt', (req, res) => {
    res.type('text/plain');
    res.send(`Contact: mailto:security@securebank.example.com
Expires: 2025-12-31T23:59:59.000Z
Encryption: N/A
Acknowledgments: https://securebank.example.com/security/acknowledgments
Policy: https://securebank.example.com/security/policy
Hiring: https://securebank.example.com/careers
Preferred-Languages: en
Canonical: https://${req.headers.host}/.well-known/security.txt
# This is an educational demo application`);
  });

  // Determine port (use environment variable for deployment platforms)
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Security headers: Configured for educational demo`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API URL: http://localhost:${port}`);
    }
  });
}

main().catch(console.error);
