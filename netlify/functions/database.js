const fs = require('fs');
const path = require('path');

// This function will handle database operations
exports.handler = async function(event, context) {
  // Get the request path and method
  const path = event.path.replace('/.netlify/functions/database', '');
  const method = event.httpMethod;
  
  try {
    // Example: Reading from the JSON files (simulating database access)
    if (method === 'GET') {
      if (path === '/users') {
        // This would normally be a database query
        const usersData = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
        
        return {
          statusCode: 200,
          body: JSON.stringify(usersData)
        };
      }
      
      if (path === '/sessions') {
        const sessionsData = JSON.parse(fs.readFileSync('./data/sessions.json', 'utf8'));
        
        return {
          statusCode: 200,
          body: JSON.stringify(sessionsData)
        };
      }
    }
    
    // Default response for unhandled routes
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Not Found" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
}; 