import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import NodeCache from 'node-cache';
import path from 'path';
import { readFileSync } from 'fs';

// Initialize in-memory cache with 10min default TTL
export const appCache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Cache middleware function for API responses
export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for POST/PUT/DELETE requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = appCache.get(key);

    if (cachedBody) {
      // Return cached response
      res.send(cachedBody);
      return;
    }

    // Store original send
    const originalSend = res.send;

    // Override send method to cache the response
    // @ts-ignore - Overriding the send method
    res.send = function(body: any): Response {
      appCache.set(key, body, duration);
      // @ts-ignore - Calling the original send with the new body
      return originalSend.call(this, body);
    };

    next();
  };
};

// Middleware to handle browser caching for static assets
export const staticAssetCache = (maxAge: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip for HTML files
    if (path.extname(req.url) === '.html') {
      return next();
    }

    // Apply cache headers
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
};

// Optimize response size with compression
export const setupCompression = (app: express.Application): void => {
  // Use compression for all responses
  app.use(compression({
    level: 6, // Balance between compression and CPU usage
    threshold: 0, // Compress all responses
    filter: (req, res) => {
      // Don't compress responses with this header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Compress everything else
      return true;
    }
  }));
};

// Pre-load common JSON data into memory
export const preloadData = () => {
  try {
    // Load common data files in memory to avoid disk I/O
    const dataPath = path.join(process.cwd(), 'data');
    
    // We don't cache users.json as it needs to be read freshly each time
    try {
      const notifications = readFileSync(path.join(dataPath, 'notifications.json'), 'utf8');
      appCache.set('notifications', JSON.parse(notifications), 60); // 1 minute TTL
      console.log('Preloaded common data into memory cache');
    } catch (err) {
      console.log('No notifications.json file found to preload');
    }
  } catch (error) {
    console.error('Failed to preload data:', error);
  }
};

// Get all cached keys (useful for debugging)
export const getCachedKeys = (): string[] => {
  return appCache.keys();
};

// Clear all cache (useful for maintenance)
export const clearAllCache = (): void => {
  appCache.flushAll();
}; 