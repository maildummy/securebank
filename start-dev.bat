
@echo off
echo Starting development preview for Windows...

echo Starting client application...
cd client && npx vite --port 5173

echo Client started! You can access the application at:
echo http://localhost:5173
