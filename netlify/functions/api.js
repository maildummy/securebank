// Simple API endpoint for demonstration
exports.handler = async function(event, context) {
  // You can access your data files from here
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "API is working!",
      status: "success",
      demo: true
    })
  };
}; 