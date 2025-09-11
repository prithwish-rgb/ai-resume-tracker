# AI Resume Tracker - Setup Guide

## Quick Fix for Current Error

The MongoDB connection error you're seeing is because the app needs a database connection. Here are two solutions:

### Option 1: Quick Demo Mode (No Database)
1. Create a `.env.local` file in the project root
2. Add this minimal configuration:
```
NEXTAUTH_SECRET=your-super-secret-key-here
MONGODB_URI=mongodb://localhost:27017/ai-resume-tracker
```

### Option 2: Full Setup with MongoDB Atlas (Recommended)

1. **Create a MongoDB Atlas account** (free tier available):
   - Go to https://cloud.mongodb.com
   - Sign up for free
   - Create a new cluster

2. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Create `.env.local` file** in the project root:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-resume-tracker?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-super-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

5. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Features Available

Once set up, you'll have access to:
- ✅ Job application tracking
- ✅ Resume builder
- ✅ AI-powered recommendations
- ✅ Interview preparation
- ✅ Analytics dashboard
- ✅ Company intelligence
- ✅ Network outreach tools

## Troubleshooting

If you still see connection errors:
1. Check your MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
2. Verify your connection string format
3. Make sure your database user has read/write permissions
