/**
 * This script optimizes and compresses static assets for better performance
 * Run it after build: node optimize-assets.js
 */
import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistDir = path.join(__dirname, 'client', 'dist');
const distClientDir = path.join(__dirname, 'dist', 'client');

// Function to recursively process files
async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else {
      // Only compress JS, CSS, and SVG files
      if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.svg')) {
        try {
          const content = fs.readFileSync(filePath);
          const compressed = gzipSync(content, { level: 9 }); // Maximum compression
          fs.writeFileSync(`${filePath}.gz`, compressed);
          console.log(`Compressed: ${filePath}`);
        } catch (error) {
          console.error(`Error compressing ${filePath}:`, error);
        }
      }
    }
  }
}

// Find which directory exists
async function optimizeAssets() {
  console.log('Starting asset optimization...');
  
  let targetDir;
  if (fs.existsSync(clientDistDir)) {
    targetDir = clientDistDir;
    console.log(`Using directory: ${clientDistDir}`);
  } else if (fs.existsSync(distClientDir)) {
    targetDir = distClientDir;
    console.log(`Using directory: ${distClientDir}`);
  } else {
    console.error('Could not find client build directory');
    process.exit(1);
  }
  
  await processDirectory(targetDir);
  console.log('Asset optimization completed!');
}

// Run optimization
optimizeAssets().catch(console.error); 