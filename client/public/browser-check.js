// Browser restriction script
(function() {
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
          <p>Download links:</p>
          <ul style="list-style: none; padding: 0;">
            <li><a href="https://www.palemoon.org/" target="_blank">Pale Moon</a></li>
            <li><a href="http://kmeleonbrowser.org/" target="_blank">K-Meleon</a></li>
          </ul>
        </div>
      `;
      return false;
    }
    
    return true;
  }

  // Check browser immediately
  restrictBrowserAccess();
})(); 