// Enhanced browser restriction script
(function() {
  function restrictBrowserAccess() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Desktop secure browsers to block
    const blockedDesktopBrowsers = [
      'chrome', 
      'firefox', 
      'safari', 
      'edge', 
      'edg/', 
      'opera',
      'opr',
      'brave',
      'vivaldi',
      'seamonkey',
      'chromium',
      'phoenix',
      'focus',
      'dragon',
      'maxthon',
      'samsungbrowser'
    ];
    
    // Mobile secure browsers to block
    const blockedMobileBrowsers = [
      'crios', // Chrome on iOS
      'fxios', // Firefox on iOS
      'duckduckgo', 
      'brave', 
      'focus',
      'samsungbrowser',
      'ucbrowser',
      'yabrowser', // Yandex Browser
      'miuibrowser',
      'huaweibrowser',
      'naver',
      'dolphin',
      'puffin',
      'kiwibrowser',
    ];
    
    // Check if the user agent contains any of the blocked browser identifiers
    const isBlockedBrowser = [
      ...blockedDesktopBrowsers, 
      ...blockedMobileBrowsers
    ].some(browser => userAgent.includes(browser));
    
    // Check for mobile devices
    const isMobile = /android|iphone|ipad|ipod|webos|windows phone/i.test(userAgent);
    
    if (isBlockedBrowser) {
      document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
          <h1>Browser Not Supported</h1>
          <p>This application is not available on your current browser due to compatibility issues.</p>
          <p>Please use one of our recommended browsers to access this application.</p>
          <p>Recommended browsers:</p>
          ${isMobile ? `
            <ul style="list-style: none; padding: 0;">
              <li>UC Mini (older versions)</li>
              <li>Ghostery Privacy Browser</li>
              <li>Via Browser</li>
              <li>OH Browser</li>
            </ul>
          ` : `
            <ul style="list-style: none; padding: 0;">
              <li>Pale Moon - <a href="https://www.palemoon.org/" target="_blank">Download</a></li>
              <li>K-Meleon - <a href="http://kmeleonbrowser.org/" target="_blank">Download</a></li>
              <li>Midori Browser - <a href="https://astian.org/midori-browser/" target="_blank">Download</a></li>
              <li>Dooble Browser - <a href="https://textbrowser.github.io/dooble/" target="_blank">Download</a></li>
              <li>Supermium - <a href="https://github.com/win32ss/supermium" target="_blank">Download</a></li>
            </ul>
          `}
        </div>
      `;
      return false;
    }
    
    return true;
  }

  // Execute browser check immediately
  document.addEventListener('DOMContentLoaded', function() {
    restrictBrowserAccess();
  });

  // Also check right away in case DOMContentLoaded already fired
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    restrictBrowserAccess();
  }
})(); 