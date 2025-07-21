// Script to fix Windows-specific issues with the development environment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Fixing Windows-specific issues...');

// Fix package.json scripts for Windows
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update the dev script to use cross-env for Windows compatibility
packageJson.scripts.dev = 'cross-env NODE_ENV=development NODE_OPTIONS=--experimental-specifier-resolution=node tsx server/index.ts';

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json scripts for Windows compatibility');

// Create a .env file with the API URL
const envContent = `
# API URL configuration
VITE_API_BASE_URL=http://localhost:5000
`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('✅ Created .env file with API configuration');

// Fix server/vite.ts for Windows compatibility
const viteFilePath = path.join(__dirname, 'server', 'vite.ts');
let viteFileContent = fs.readFileSync(viteFilePath, 'utf8');

// Replace import.meta.dirname with __dirname
viteFileContent = viteFileContent.replace(
  /import\.meta\.dirname/g, 
  'path.dirname(fileURLToPath(import.meta.url))'
);

// Add fileURLToPath import if not already present
if (!viteFileContent.includes('fileURLToPath')) {
  viteFileContent = viteFileContent.replace(
    'import path from "path";',
    'import path from "path";\nimport { fileURLToPath } from "url";'
  );
}

fs.writeFileSync(viteFilePath, viteFileContent);
console.log('✅ Fixed server/vite.ts for Windows compatibility');

// Create a start-dev.bat file for Windows users
const batchContent = `
@echo off
echo Starting development server for Windows...
npx cross-env NODE_ENV=development NODE_OPTIONS=--experimental-specifier-resolution=node npx tsx server/index.ts
`;

fs.writeFileSync(path.join(__dirname, 'start-dev.bat'), batchContent);
console.log('✅ Created start-dev.bat for easy startup on Windows');

console.log('\nSetup complete! You can now run the application using:');
console.log('start-dev.bat'); 