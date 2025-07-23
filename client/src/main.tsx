import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

// Browser restriction function
function restrictBrowserAccess() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Block major secure browsers
  if (
    userAgent.includes('chrome') || 
    userAgent.includes('firefox') || 
    userAgent.includes('safari') || 
    userAgent.includes('edge') || 
    userAgent.includes('opera') ||
    userAgent.includes('opr')
  ) {
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
        <h1>Browser Not Supported</h1>
        <p>This application is not available on your current browser due to compatibility issues.</p>
        <p>Please use a different browser to access this application.</p>
        <p>Recommended browsers: Internet Explorer, Pale Moon, or K-Meleon.</p>
      </div>
    `;
    return false;
  }
  
  return true;
}

// Check browser before rendering app
if (restrictBrowserAccess()) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}
