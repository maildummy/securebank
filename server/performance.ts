import express from 'express';
import path from 'path';
import fs from 'fs';
import { setupCompression, staticAssetCache, cacheMiddleware, preloadData } from './optimize';

/**
 * Apply performance optimizations to the Express application
 * @param app Express application
 */
export function optimizeServer(app: express.Application): void {
  // Enable compression
  setupCompression(app);

  // Cache static assets
  const clientDir = path.join(process.cwd(), 'dist', 'client');
  
  // Preload frequently accessed data
  preloadData();
  
  // Add cache control headers for static assets (1 week)
  app.use('/assets', staticAssetCache(60 * 60 * 24 * 7));
  
  // API response caching for read-only endpoints
  app.use('/api/user/me', cacheMiddleware(30)); // 30 seconds
  app.use('/api/notifications', cacheMiddleware(60)); // 1 minute
  
  // Optimize static file serving
  app.get('*.js', function (req, res, next) {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript');
    next();
  });

  app.get('*.css', function (req, res, next) {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/css');
    next();
  });
} 