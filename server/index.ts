// This file is the entry point for the server. It creates an Express server,
// configures it, and starts it.

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import compression from 'compression';

import { expressApp as createRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize or reset the data directory and files if they don't exist
const initializeData = () => {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Create files if they don't exist
  const files = ['users.json', 'sessions.json', 'creditCards.json', 'notifications.json', 'messages.json'];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      const initialData = file === 'users.json' ? 
        [
          {
            id: uuidv4(),
            username: 'Jude_Ogwu.U',
            password: bcrypt.hashSync('Jude_O.U@2000', 10), // Hash admin password
            role: 'admin',
            secureNote: 'DEMO ONLY: Original password was Jude_O.U@2000',
            email: 'admin@example.com',
            firstName: 'Jude',
            lastName: 'Ogwu',
            phone: '555-123-4567',
            dateOfBirth: '1985-05-15',
            address: '123 Admin St',
            city: 'Adminville',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ] : 
        (file === 'messages.json' ? 
          {
            users: {},
            channels: {},
            messages: [],
            lastId: 0
          } : []);
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
  });

  // Ensure messages.json is properly initialized
  const messagesPath = path.join(dataDir, 'messages.json');
  try {
    const messagesContent = fs.readFileSync(messagesPath, 'utf-8');
    const messages = JSON.parse(messagesContent);
    
    // If messages.json is an empty array, initialize it with the proper structure
    if (Array.isArray(messages) && messages.length === 0) {
      const messagesData = {
        users: {},
        channels: {},
        messages: [],
        lastId: 0
      };
      fs.writeFileSync(messagesPath, JSON.stringify(messagesData, null, 2));
    }
  } catch (error) {
    console.error('Error reading or parsing messages.json:', error);
    // Reinitialize messages.json with the proper structure
    const messagesData = {
      users: {},
      channels: {},
      messages: [],
      lastId: 0
    };
    fs.writeFileSync(messagesPath, JSON.stringify(messagesData, null, 2));
  }
  
  console.log("Data initialization complete");
};

const app = express();
const port = process.env.PORT || 5000;

// Initialize data
initializeData();

// Configure security settings and middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ss-bank.onrender.com', 'https://securebank-a4ob.onrender.com'] 
    : '*'
}));

// PERFORMANCE OPTIMIZATION: Add compression
app.use(compression({
  level: 6, // Balance between compression and CPU usage
  threshold: 0 // Compress all responses
}));

// Set more permissive security headers for the demo site
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Add educational demo headers to clearly indicate this is a demo site
app.use((req, res, next) => {
  res.setHeader('X-Educational-Demo', 'true');
  res.setHeader('X-Demo-Purpose', 'This is an educational demo site for a portfolio project');
  res.setHeader('X-Demo-Notice', 'This site does not process real transactions or store sensitive information');
  res.setHeader('X-Demo-Warning', 'DO NOT ENTER REAL CREDIT CARD INFORMATION OR PERSONAL DETAILS');
  
  // Add Google-specific safe browsing headers
  res.setHeader('X-Google-Safe-Browsing-Allowlist', 'educational-demo,portfolio-project');
  res.setHeader('X-Purpose', 'Preview');
  
  // Add report-to header for security reporting
  res.setHeader('Report-To', '{"group":"default","max_age":10886400,"endpoints":[{"url":"https://ss-bank.onrender.com/api/security-report"}]}');
  next();
});

// Parse JSON request bodies
app.use(express.json());

// PERFORMANCE OPTIMIZATION: Add cache control headers for static assets
app.use('/assets', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
  next();
});

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production' && process.env.SECURE_SITE === 'true') {
  app.use((req, res, next) => {
    // Allow .well-known for Let's Encrypt and other verification services
    if (req.url.startsWith('/.well-known')) {
      return next();
    }
    
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// Create routes
createRoutes(app);

// Check for client build files in multiple possible locations
const possibleClientPaths = [
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'dist', 'client'),
  path.join(__dirname, '..', 'client', 'dist'),
  path.join(__dirname, '..', 'dist', 'client'),
  path.join(__dirname, 'client'),
  path.join(__dirname, 'public')
];

let clientBuildPath = '';
for (const p of possibleClientPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    clientBuildPath = p;
    console.log(`Found client build at: ${clientBuildPath}`);
    break;
  }
}

// Serve static files if client build exists
if (clientBuildPath) {
  app.use(express.static(clientBuildPath, {
    maxAge: '1d', // Cache for 1 day
    immutable: true,
    lastModified: true
  }));
  
  // Serve index.html for any non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    // Skip API routes and well-known paths
    if (req.url.startsWith('/api') || req.url.startsWith('/.well-known')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Special route for security.txt
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain');
  res.send(`Contact: mailto:demo@example.com
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://ss-bank.onrender.com/.well-known/security.txt
Policy: https://ss-bank.onrender.com/security-policy
Hiring: https://ss-bank.onrender.com/careers
`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Security headers: Configured for educational demo`);
});

export default app;
