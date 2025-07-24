import { createServer } from 'http';
import { parse } from 'url';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../server/routes.js';
import { storage } from '../server/storage.js';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Register all API routes
await registerRoutes(app);

// Initialize data
await storage.initializeData();

// Export the Express API
export default async function handler(req, res) {
  // Parse URL
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;
  
  // Forward the request to Express
  return new Promise((resolve, reject) => {
    // This is necessary for the Express server to correctly process the request
    req.url = pathname;
    
    const server = createServer(app);
    
    // Handle the request
    app(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
} 