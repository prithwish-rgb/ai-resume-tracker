# 🚀 Vercel Deployment Instructions

## Prerequisites Checklist

Before deploying, ensure you have completed:
- ✅ GitHub repository created and code pushed
- ✅ MongoDB Atlas database set up
- ✅ GitHub OAuth app configured
- ✅ Google OAuth app configured
- ✅ All environment variables ready

## Step-by-Step Vercel Deployment

### 1. Create Vercel Account
- Visit [vercel.com](https://vercel.com)
- Sign up with your GitHub account (recommended)
- This will automatically connect your GitHub repositories

### 2. Import Your Repository
1. **Click "New Project"** on your Vercel dashboard
2. **Import from Git** - Select your GitHub account
3. **Find your repository** - Search for `ai-resume-tracker`
4. **Click "Import"** next to your repository

### 3. Configure Project Settings
**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (default)
**Build Command**: `npm run build` (default)
**Output Directory**: `.next` (default)
**Install Command**: `npm install` (default)

### 4. Set Environment Variables
Click on **"Environment Variables"** and add each one:

```env
# Database
MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/ai-resume-tracker?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET
Value: [Generate with: openssl rand -base64 32]

NEXTAUTH_URL
Value: [Will be provided after first deployment - use https://your-app-name.vercel.app]

# GitHub OAuth
GITHUB_CLIENT_ID
Value: [Your GitHub OAuth Client ID]

GITHUB_CLIENT_SECRET
Value: [Your GitHub OAuth Client Secret]

# Google OAuth  
GOOGLE_CLIENT_ID
Value: [Your Google OAuth Client ID]

GOOGLE_CLIENT_SECRET
Value: [Your Google OAuth Client Secret]

# Environment
NODE_ENV
Value: production
```

### 5. Deploy
1. **Click "Deploy"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Get your deployment URL** (e.g., `https://ai-resume-tracker.vercel.app`)

### 6. Update OAuth Redirect URLs

#### Update GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click on your "AI Resume Tracker" app
3. **Update Authorization callback URL** to:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/github
   ```

#### Update Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth credentials
3. **Add authorized redirect URI**:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/google
   ```

### 7. Update NEXTAUTH_URL Environment Variable
1. Go back to your Vercel dashboard
2. Navigate to Settings → Environment Variables
3. **Update NEXTAUTH_URL** to your actual deployment URL:
   ```
   https://your-vercel-app.vercel.app
   ```
4. **Redeploy** by going to Deployments and clicking "Redeploy"

### 8. Test Your Deployment
1. **Visit your app** at the Vercel URL
2. **Test authentication** with both GitHub and Google
3. **Test job creation** and management features
4. **Test on mobile devices** to verify responsiveness
5. **Check all major features** work correctly

## Custom Domain Setup (Optional)

### 1. Add Domain to Vercel
1. Go to Settings → Domains in your Vercel dashboard
2. Add your custom domain (e.g., `myresume-tracker.com`)
3. Configure DNS records as instructed

### 2. Update Environment Variables
1. **Update NEXTAUTH_URL** to your custom domain
2. **Update OAuth redirect URLs** to use your custom domain
3. **Redeploy the application**

## Environment Variables Quick Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `MONGODB_URI` | Database connection | MongoDB Atlas dashboard |
| `NEXTAUTH_SECRET` | Auth secret key | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | Vercel deployment URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth ID | GitHub OAuth app settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | GitHub OAuth app settings |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Cloud Console |

## Troubleshooting Common Issues

### ❌ Build Failures
**Issue**: Deployment fails during build
**Solutions**:
- Check all environment variables are set correctly
- Verify no TypeScript errors in your code
- Check Vercel function logs for specific errors

### ❌ Authentication Not Working
**Issue**: Users can't sign in with GitHub/Google
**Solutions**:
- Verify OAuth redirect URLs match your deployment domain
- Check that `NEXTAUTH_URL` matches your actual domain
- Ensure `NEXTAUTH_SECRET` is set and valid

### ❌ Database Connection Issues
**Issue**: Can't connect to MongoDB
**Solutions**:
- Verify MongoDB Atlas allows connections from all IPs (`0.0.0.0/0`)
- Check database user has correct permissions
- Verify connection string format is correct

### ❌ Responsive Design Issues
**Issue**: Layout breaks on mobile
**Solutions**:
- Clear browser cache
- Test in incognito/private mode
- Check CSS imports are working correctly

## Monitoring Your Deployment

### Vercel Analytics
1. **Enable Analytics** in your Vercel dashboard
2. **Monitor performance** and user engagement
3. **Track errors** and loading times

### MongoDB Atlas Monitoring
1. **Monitor database performance** in Atlas dashboard
2. **Check connection limits** and usage
3. **Set up alerts** for high usage or errors

## Continuous Deployment

Your app is now set up for **automatic deployments**:
- **Push to GitHub** → **Automatically deploys to Vercel**
- **Pull requests** → **Create preview deployments**
- **Main branch** → **Updates production deployment**

## Success! 🎉

Your AI Resume Tracker is now live and accessible to users worldwide!

**Next Steps**:
1. Share your app with friends and colleagues
2. Monitor usage and performance
3. Gather user feedback for improvements
4. Consider adding more features from the roadmap

**Your deployment URLs**:
- **Production**: `https://your-app-name.vercel.app`
- **GitHub Repository**: `https://github.com/yourusername/ai-resume-tracker`

---

**Need help?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) file for additional troubleshooting and advanced configuration options.
