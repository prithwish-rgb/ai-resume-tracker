import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  console.log("=== Starting MongoDB Debug Test ===");
  
  const uri = process.env.MONGODB_URI;
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  
  console.log("Environment check:", {
    NODE_ENV: nodeEnv,
    VERCEL_ENV: vercelEnv,
    URI_EXISTS: !!uri,
    URI_PREFIX: uri?.substring(0, 20) + "...",
    RUNTIME: typeof globalThis !== 'undefined' ? 'Node.js' : 'Unknown'
  });

  if (!uri) {
    const error = "MONGODB_URI environment variable is not set";
    console.error("❌", error);
    return NextResponse.json({
      success: false,
      error,
      environment: { nodeEnv, vercelEnv },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  // Test multiple connection configurations
  const configs = [
    {
      name: "Standard Config",
      options: {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        retryReads: true,
      }
    },
    {
      name: "Serverless Optimized",
      options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 1,
        minPoolSize: 0,
        maxIdleTimeMS: 5000,
        retryWrites: true,
        retryReads: false,
        bufferMaxEntries: 0,
      }
    }
  ];

  const results = [];

  for (const config of configs) {
    console.log(`\n--- Testing ${config.name} ---`);
    const startTime = Date.now();
    let client: MongoClient | null = null;
    
    try {
      console.log("Creating MongoClient with options:", config.options);
      client = new MongoClient(uri, config.options);
      
      console.log("Attempting connection...");
      await client.connect();
      
      const connectTime = Date.now() - startTime;
      console.log(`✅ Connected with ${config.name} in ${connectTime}ms`);
      
      // Test database operations
      const db = client.db("ai-resume-tracker");
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      console.log("Database operations successful:", { collectionNames });
      
      results.push({
        config: config.name,
        success: true,
        connectTime,
        collections: collectionNames,
      });
      
    } catch (error) {
      const connectTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`❌ ${config.name} failed after ${connectTime}ms:`, errorMessage);
      
      // Analyze error type
      let errorType = "unknown";
      if (errorMessage.includes("authentication")) errorType = "auth";
      else if (errorMessage.includes("timeout")) errorType = "timeout";
      else if (errorMessage.includes("network")) errorType = "network";
      else if (errorMessage.includes("ENOTFOUND")) errorType = "dns";
      
      results.push({
        config: config.name,
        success: false,
        connectTime,
        error: errorMessage,
        errorType,
      });
      
    } finally {
      if (client) {
        try {
          await client.close();
          console.log(`🔌 Closed ${config.name} connection`);
        } catch (closeError) {
          console.warn(`⚠️  Error closing ${config.name} connection:`, closeError);
        }
      }
    }
  }

  const totalTime = Date.now() - Date.now();
  console.log("=== Debug Test Complete ===");

  return NextResponse.json({
    success: results.some(r => r.success),
    environment: {
      NODE_ENV: nodeEnv,
      VERCEL_ENV: vercelEnv,
      runtime: process.version,
      platform: process.platform,
    },
    results,
    timestamp: new Date().toISOString(),
    uriAnalysis: {
      hasCredentials: uri.includes("@"),
      hasDatabase: uri.includes("/ai-resume-tracker"),
      hasRetryWrites: uri.includes("retryWrites=true"),
      hasAppName: uri.includes("appName=Cluster0"),
    }
  });
}

export const runtime = 'nodejs';
export const maxDuration = 30;
