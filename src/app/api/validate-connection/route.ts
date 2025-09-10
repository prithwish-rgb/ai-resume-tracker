import { NextResponse } from "next/server";

export async function GET() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return NextResponse.json({
      success: false,
      error: "MONGODB_URI not found",
      solutions: [
        "Add MONGODB_URI to your Vercel environment variables",
        "Make sure the variable is set for 'Production' environment",
        "Redeploy your app after adding the environment variable"
      ]
    });
  }

  // Parse the connection string to validate components
  try {
    const url = new URL(uri);
    const analysis = {
      protocol: url.protocol,
      username: url.username,
      password: url.password ? "[REDACTED]" : "MISSING",
      hostname: url.hostname,
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams.entries())
    };

    // Common issues and solutions
    const issues = [];
    const solutions = [];

    // Check for common problems
    if (!url.username || !url.password) {
      issues.push("Missing credentials in connection string");
      solutions.push("Ensure username and password are properly encoded in the URI");
    }

    if (!url.pathname || url.pathname === "/") {
      issues.push("No database name specified");
      solutions.push("Add database name to the URI: /your-database-name");
    }

    if (!url.searchParams.has("retryWrites")) {
      issues.push("Missing retryWrites parameter");
      solutions.push("Add ?retryWrites=true to the URI");
    }

    // Verify encoding
    const originalPassword = "Iambored@22";
    const encodedPassword = "Iambored%4022";
    const isPasswordCorrect = uri.includes(encodedPassword);
    
    if (!isPasswordCorrect && uri.includes("Iambored")) {
      issues.push("Password encoding might be incorrect");
      solutions.push("Verify @ symbol is encoded as %40 in the password");
    }

    // Alternative connection strings to test
    const alternatives = [
      {
        name: "With explicit SSL",
        uri: uri + (uri.includes("?") ? "&" : "?") + "ssl=true"
      },
      {
        name: "With TLS settings",  
        uri: uri + (uri.includes("?") ? "&" : "?") + "tls=true&tlsInsecure=false"
      },
      {
        name: "Simplified parameters",
        uri: uri.replace(/[?&]appName=[^&]*/, "").replace(/[?&]w=majority/, "")
      }
    ];

    return NextResponse.json({
      success: true,
      analysis,
      issues: issues.length > 0 ? issues : ["No obvious issues found"],
      solutions: solutions.length > 0 ? solutions : [
        "Connection string appears valid",
        "Check MongoDB Atlas IP whitelist settings",
        "Verify cluster is running and accessible"
      ],
      alternatives,
      recommendations: [
        "1. Check MongoDB Atlas Network Access - add 0.0.0.0/0 for Vercel",
        "2. Verify cluster is not paused",
        "3. Test connection string in MongoDB Compass locally",
        "4. Check Vercel function logs for detailed errors",
        "5. Try the debug endpoint: /api/debug-db"
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Invalid connection string format",
      details: error instanceof Error ? error.message : String(error),
      example: "mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
    });
  }
}
