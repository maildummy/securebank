// This file is a wrapper around the main server to apply optimizations
// without modifying the original server code directly

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import NodeCache from 'node-cache';

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize cache
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60 // Check for expired keys every 60 seconds
});

console.log("Current directory:", process.cwd());
console.log("__dirname:", __dirname);

// PERFORMANCE OPTIMIZATIONS

// Enable compression
app.use(compression({
  level: 6, // Balance between compression and CPU usage
  threshold: 0 // Compress all responses
}));

// Setup CORS and security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ss-bank.onrender.com', 'https://securebank-a4ob.onrender.com'] 
    : '*'
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Parse JSON requests
app.use(express.json());

// Cache API responses
const apiCache = (duration: number) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `__express__${req.originalUrl}`;
    const cachedBody = cache.get(key);
    
    if (cachedBody) {
      return res.send(cachedBody);
    }
    
    // Store original send
    const originalSend = res.send;
    
    // @ts-ignore - We're overriding the send method
    res.send = function(body) {
      // Don't cache error responses
      if (res.statusCode < 400) {
        cache.set(key, body, duration);
      }
      // @ts-ignore - Call the original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
};

// Apply caching to specific routes
app.use('/api/user/me', apiCache(30)); // 30 seconds
app.use('/api/notifications', apiCache(60)); // 1 minute

// Optimize static file serving with compression
// Check all possible client build locations
const possiblePaths = [
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'dist', 'client', 'dist'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'dist', 'client'),
  path.join(__dirname, 'client'),
  path.join(__dirname, '..', 'dist', 'client'),
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'dist', 'public'),
  path.join(__dirname, '..', 'dist', 'public')
];

console.log("Checking these paths for client files:");
possiblePaths.forEach(p => console.log(" -", p));

let staticPath = '';
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      const files = fs.readdirSync(p);
      if (files.includes('index.html')) {
        staticPath = p;
        console.log(`4:${new Date().getMinutes()}:${new Date().getSeconds()} AM [express] Found client dist at: ${staticPath}`);
        break;
      }
      console.log(`Files in ${p}:`, files);
    } catch (err) {
      console.error(`Error reading directory ${p}:`, err);
    }
  }
}

// Add Cache-Control headers for static assets
app.use('/assets', (req, res, next) => {
  // 1 week cache for static assets
  res.setHeader('Cache-Control', 'public, max-age=604800');
  next();
});

// Serve static files with proper headers
if (staticPath) {
  app.use(express.static(staticPath, {
    maxAge: '1d', // Default cache time
    immutable: true,
    lastModified: true
  }));
}

// Import the original server
import './index.js';

// Export the app for testing
export default app; 