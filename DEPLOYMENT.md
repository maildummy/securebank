# SecureBank Online Banking Platform Deployment Guide

This guide provides step-by-step instructions for deploying the SecureBank Online Banking Platform to Render.com.

## Prerequisites

1. A [Render.com](https://render.com) account
2. A [GitHub](https://github.com) account
3. Git installed on your local machine

## Step 1: Push Your Code to GitHub

1. Create a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/securebank.git
   git push -u origin main
   ```

## Step 2: Deploy Using Render Blueprint

The easiest way to deploy this application is using the Render Blueprint (render.yaml file):

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and create both services:
   - `onlinebank-backend` (Node.js web service)
   - `onlinebank-frontend` (Static site)
5. Review the configuration and click "Apply"
6. Wait for both services to deploy

## Step 3: Manual Deployment (Alternative to Blueprint)

If the Blueprint method doesn't work, you can deploy each service manually:

### Deploy Backend

1. From your Render Dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `onlinebank-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:server`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
4. Click "Create Web Service"
5. Wait for the deployment to complete
6. Note the URL of your backend service (e.g., `https://onlinebank-backend.onrender.com`)

### Deploy Frontend

1. From your Render Dashboard, click "New" and select "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `onlinebank-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
4. Click "Create Static Site"
5. Wait for the deployment to complete

### Configure API Routing

1. In your Render Dashboard, go to the `onlinebank-frontend` static site
2. Click on "Redirects/Rewrites"
3. Add a new rule:
   - **Source**: `/api/*`
   - **Destination**: `https://onlinebank-backend.onrender.com/api/$1`
   - **Type**: Rewrite
4. Click "Save Changes"

## Step 4: Update Frontend API URL

If your backend URL is different from what's in the render.yaml file, you'll need to update the API URL:

1. In your Render Dashboard, go to the `onlinebank-frontend` static site
2. Click on "Environment"
3. Add a new environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://onlinebank-backend.onrender.com`)
4. Click "Save Changes"
5. Trigger a manual deploy to apply the changes

## Step 5: Test Your Deployment

1. Visit your frontend URL (e.g., `https://onlinebank-frontend.onrender.com`)
2. Try logging in with the admin account:
   - **Username**: `Jude_Ogwu.U`
   - **Password**: `Jude_O.U@2000`
3. Verify that you can access the admin dashboard
4. Test user signup and credit card submission
5. Verify that messaging between users and admin works

## Important Notes

1. **Data Persistence**: The application uses file-based storage, which is reset whenever the server restarts on Render. For a production environment, consider implementing a database solution.

2. **Admin Account**: The default admin account is:
   - **Username**: `Jude_Ogwu.U`
   - **Password**: `Jude_O.U@2000`

3. **Security**: This is a demo application. For a real banking platform, additional security measures would be necessary.

## Troubleshooting

If you encounter any issues:

1. **Backend not starting**: Check the logs in your Render Dashboard. Common issues include:
   - Missing environment variables
   - Build errors
   - Runtime errors

2. **API calls failing**: Verify that:
   - The API rewrite rule is correctly configured
   - The backend service is running
   - CORS is properly configured

3. **Frontend not loading**: Check:
   - Build logs for any errors
   - That the publish directory is correctly set to `client/dist`

4. **Authentication issues**: Ensure that:
   - The session management is working correctly
   - The Authorization header is being properly set

## Maintaining Your Deployment

- Set up automatic deployments from your GitHub repository
- Monitor your application's performance and logs
- Regularly update dependencies for security patches
- Implement a proper database solution for production use 