# 🚀 Deployment Guide

This guide walks you through deploying the AI Resume Tracker to production.

## Prerequisites

Before deploying, ensure you have:
- [ ] MongoDB Atlas database set up
- [ ] OAuth apps configured (GitHub & Google)
- [ ] All environment variables ready
- [ ] Domain name (optional but recommended)

## 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster

2. **Configure Database Access**
   - Go to Database Access
   - Add a new database user
   - Set username and password
   - Grant "Atlas admin" role

3. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows access from anywhere)
   - This is needed for Vercel serverless functions

4. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 2. OAuth Configuration

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: AI Resume Tracker
   - **Homepage URL**: `https://yourdomain.com` (or your Vercel URL)
   - **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`
4. Copy Client ID and Client Secret

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Configure OAuth consent screen if needed
6. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret

## 3. Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/ai-resume-tracker.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Set Environment Variables**
   In Vercel dashboard, go to Settings → Environment Variables and add:
   
   ```env
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-resume-tracker?retryWrites=true&w=majority
   NEXTAUTH_SECRET=your-production-secret-here
   NEXTAUTH_URL=https://your-vercel-app.vercel.app
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### Option B: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add GITHUB_CLIENT_ID
   vercel env add GITHUB_CLIENT_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## 4. Post-Deployment Steps

### Update OAuth Redirect URLs
1. **GitHub**: Update the Authorization callback URL to your Vercel domain
2. **Google**: Update the authorized redirect URIs to your Vercel domain

### Verify Deployment
1. Visit your deployed app
2. Test authentication with GitHub and Google
3. Test job creation and management
4. Check all responsive breakpoints

### Custom Domain (Optional)
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain
5. Update OAuth redirect URLs to your custom domain

## 5. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app's URL | `https://yourapp.vercel.app` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | From GitHub OAuth app |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | From GitHub OAuth app |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Cloud Console |
| `NODE_ENV` | Environment mode | `production` |

## 6. Monitoring and Maintenance

### Vercel Analytics
- Enable Web Analytics in your Vercel dashboard
- Monitor performance and usage

### Error Monitoring
- Check Vercel Function logs for errors
- Monitor MongoDB Atlas for connection issues

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Deploy updates
git add .
git commit -m "Update dependencies"
git push origin main
```

## 7. Troubleshooting

### Common Issues

**Build Failures**
- Check that all environment variables are set
- Verify TypeScript types are correct
- Check for missing dependencies

**Authentication Issues**
- Verify OAuth redirect URLs match your domain
- Check that `NEXTAUTH_URL` is correct
- Ensure `NEXTAUTH_SECRET` is set

**Database Connection Issues**
- Verify MongoDB Atlas network access allows all IPs
- Check connection string format
- Ensure database user has correct permissions

**Responsive Issues**
- Test on multiple devices and screen sizes
- Use browser dev tools to simulate different viewports
- Check CSS media queries

### Support
- Check Vercel deployment logs
- Monitor MongoDB Atlas logs
- Review Next.js documentation
- Check GitHub issues for common problems

---

**Your app is now live! 🎉**

Remember to update your OAuth redirect URLs and test all functionality after deployment.
