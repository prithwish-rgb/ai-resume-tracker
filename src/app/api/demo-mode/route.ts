import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Demo mode is active. Database features are disabled.",
    features: {
      jobs: "You can view the UI but data won't persist",
      resumes: "You can build resumes but they won't be saved",
      analytics: "Shows demo data",
      interview: "Works with demo questions",
    },
    note: "To enable full functionality, set up MongoDB Atlas and add MONGODB_URI to .env.local"
  });
}
