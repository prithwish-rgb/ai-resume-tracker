import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug') === 'true';
  
  console.log("=== MongoDB Connection Test ===");
  console.log("Debug mode:", debug);
  console.log("Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    runtime: process.version,
    platform: process.platform
  });
  
  const uri = process.env.MONGODB_URI;
  console.log("URI exists:", !!uri);
  console.log("URI preview:", uri ? `${uri.substring(0, 25)}...` : 'MISSING');
  
  if (!uri) {
    return NextResponse.json({
      success: false,
      error: "MONGODB_URI environment variable not found",
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      solutions: [
        "Add MONGODB_URI to Vercel environment variables",
        "Set for Production environment", 
        "Redeploy after adding the variable"
      ]
    }, { status: 500 });
  }

  if (debug) {
    // Extended debug mode
    console.log("Running extended debug tests...");
    
    const results = [];
    const configs = [
      {
        name: "Serverless Quick",
        options: {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          maxPoolSize: 1,
          retryWrites: true
        }
      },
      {
        name: "Standard", 
        options: {
          serverSelectionTimeoutMS: 15000,
          connectTimeoutMS: 15000,
          maxPoolSize: 10,
          retryWrites: true
        }
      }
    ];
    
    for (const config of configs) {
      console.log(`Testing ${config.name}...`);
      const client = new MongoClient(uri, config.options);
      const startTime = Date.now();
      
      try {
        await client.connect();
        const connectTime = Date.now() - startTime;
        console.log(`✅ ${config.name} connected in ${connectTime}ms`);
        
        const db = client.db("ai-resume-tracker");
        const collections = await db.listCollections().toArray();
        
        results.push({
          config: config.name,
          success: true,
          connectTime,
          collections: collections.map(c => c.name)
        });
        
        await client.close();
        break; // Success, no need to try other configs
        
      } catch (error) {
        const connectTime = Date.now() - startTime;
        console.error(`❌ ${config.name} failed:`, error);
        
        results.push({
          config: config.name,
          success: false,
          connectTime,
          error: error instanceof Error ? error.message : String(error)
        });
        
        try { await client.close(); } catch {} // Silent cleanup
      }
    }
    
    return NextResponse.json({
      success: results.some(r => r.success),
      debug: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        runtime: process.version,
        platform: process.platform
      },
      results,
      uri_analysis: {
        has_credentials: uri.includes('@'),
        has_database: uri.includes('/ai-resume-tracker'),
        has_retry_writes: uri.includes('retryWrites=true')
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Standard test (existing functionality)
  try {
    console.log("Running standard connection test...");
    const db = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!",
      collections: collections.map(c => c.name),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection failed. Please check your MONGODB_URI in .env.local",
      environment: process.env.NODE_ENV,
      help: "Try adding ?debug=true to this URL for detailed diagnostics",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
