# SecureBank - Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the SecureBank Online Banking Platform to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account (free tier is fine)
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

## Step 2: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist/client` (important!)
5. Add the following environment variables:
   - `VITE_API_URL`: `/api` (this will use Vercel's serverless functions)
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. Follow the prompts and configure as needed
5. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Verify Your Deployment

1. Once deployment is complete, Vercel will provide you with a URL (e.g., `https://securebank-abc123.vercel.app`)
2. Visit the URL to access your application
3. Test the login functionality with the admin account:
   - **Username**: `Jude_Ogwu.U`
   - **Password**: `Jude_O.U@2000`
4. Test user registration and other features

## Important Notes

### Data Persistence

The application uses file-based storage in the `data/` directory. On Vercel, this data will be:

1. **Ephemeral**: Data will be lost when serverless functions restart
2. **Not shared**: Each serverless function instance has its own data

For a production environment, consider implementing a proper database solution like:
- MongoDB Atlas (document database)
- Supabase or Neon (PostgreSQL)
- Planetscale (MySQL)

### Environment Variables

You can add additional environment variables in the Vercel project settings:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Environment Variables"
3. Add any required variables

### Troubleshooting

If you encounter issues:

1. **API calls failing**: Check the Function Logs in your Vercel dashboard
2. **Build errors**: Check the Build Logs in your Vercel dashboard
3. **Routing issues**: Verify your `vercel.json` configuration

## Updating Your Deployment

Any push to the main branch of your GitHub repository will trigger a new deployment on Vercel.

To deploy from a different branch:
1. Go to your project settings in Vercel
2. Navigate to "Git" section
3. Change the "Production Branch" setting

## Next Steps for Production

1. **Add a custom domain**:
   - Go to your project settings in Vercel
   - Navigate to "Domains" section
   - Add your domain and follow the instructions

2. **Set up monitoring**:
   - Enable Vercel Analytics in your project settings

3. **Implement a proper database**:
   - Replace file-based storage with a database solution
   - Update the storage.ts file to use the database

4. **Add authentication providers**:
   - Consider adding OAuth providers like Google, GitHub, etc.
   - Implement two-factor authentication for added security 