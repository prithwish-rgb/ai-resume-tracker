# 🚀 AI Resume & Job Tracker

A modern, fully responsive web application built with Next.js 15+ that helps job seekers track applications, tailor resumes with AI, and prepare for interviews. Features intelligent job parsing, comprehensive analytics, and mobile-first design.

## Features

- 🔐 **Authentication**: Secure login with email/password, Google, and GitHub OAuth
- 📄 **Resume Management**: Upload, edit, and tailor resumes for different applications
- 🎯 **Job Tracking**: Track applications, interviews, and follow-ups
- 🤖 **AI Insights**: Get AI-powered suggestions for resume optimization
- 📊 **Analytics**: Track application success rates and get insights
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v4
- **Database**: MongoDB with native driver
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand
- **Animations**: Framer Motion
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   # MongoDB Configuration
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-resume-tracker?retryWrites=true&w=majority
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # GitHub OAuth (Optional)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

4. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Use the output as your `NEXTAUTH_SECRET`

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses MongoDB with the following collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed with bcrypt
  image: String, // for OAuth providers
  provider: String, // "credentials", "google", "github"
  createdAt: Date
}
```

### Sessions Collection (NextAuth)
Managed automatically by NextAuth.js MongoDB adapter.

## Project Structure

```
ai-resume-tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── auth/              # Auth pages
│   │   │   ├── signin/        # Sign in page
│   │   │   └── signup/        # Sign up page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI primitives
│   │   ├── Navbar.tsx        # Navigation component
│   │   ├── providers.tsx     # Context providers
│   │   └── Toast.tsx         # Toast notifications
│   └── lib/                  # Utility functions
│       ├── auth.ts           # Auth utilities
│       ├── mongodb.ts        # Database connection
│       └── utils.ts          # General utilities
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── .env.local              # Your environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT tokens for session management
- ✅ CSRF protection
- ✅ Environment variable validation
- ✅ Input sanitization and validation
- ✅ Secure HTTP headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please create an issue in the repository.
