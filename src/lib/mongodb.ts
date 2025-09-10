import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI as string | undefined;

// Optimized connection options for serverless environments
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const options = isProduction || isVercel ? {
  // Serverless optimized settings
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000, 
  socketTimeoutMS: 10000,
  maxPoolSize: 1, // Single connection for serverless
  minPoolSize: 0,
  maxIdleTimeMS: 5000,
  waitQueueTimeoutMS: 5000,
  retryWrites: true,
  retryReads: false,
  bufferMaxEntries: 0, // Disable mongoose buffering
  heartbeatFrequencyMS: 30000,
} : {
  // Development settings
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Create connection promise
if (!uri) {
  console.warn("MONGODB_URI is not set. Database features will be disabled.");
  clientPromise = Promise.reject(new Error("MONGODB_URI is not set"));
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export async function connectToDatabase(dbName?: string): Promise<Db> {
  if (!uri) {
    const message = "MONGODB_URI is not set. Please add it to .env.local";
    console.error(message);
    throw new Error(message);
  }
  
  try {
    console.log(`[MongoDB] Attempting to connect to database: ${dbName || 'default'}`);
    const startTime = Date.now();
    const client = await clientPromise;
    const connectTime = Date.now() - startTime;
    console.log(`[MongoDB] Connected successfully in ${connectTime}ms`);
    return client.db(dbName);
  } catch (error) {
    console.error("[MongoDB] Connection failed:", {
      error: error instanceof Error ? error.message : error,
      uri: uri ? `${uri.split('@')[0].split('//')[1]}@***` : 'undefined', // Log partial URI without credentials
      dbName,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fallback collections for when DB is not available
const createFallbackCollection = () => ({
  find: () => ({ toArray: () => Promise.resolve([]) }),
  findOne: () => Promise.resolve(null),
  insertOne: () => Promise.resolve({ insertedId: "fallback" }),
  updateOne: () => Promise.resolve({ modifiedCount: 0 }),
  deleteOne: () => Promise.resolve({ deletedCount: 0 }),
  deleteMany: () => Promise.resolve({ deletedCount: 0 }),
  countDocuments: () => Promise.resolve(0),
});

export default clientPromise;

// Collection helpers for clarity and type-safety
export type JobDoc = {
  _id?: any;
  userId: string;
  source: "manual" | "url" | "email";
  url?: string;
  company?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  status?: "saved" | "applied" | "interview" | "offer" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

export type ResumeBlock = {
  id: string;
  type: "summary" | "experience" | "project" | "education" | "skill";
  content: string;
  tags?: string[];
};

export type ResumeDoc = {
  _id?: any;
  userId: string;
  name: string; // e.g., "Default Resume"
  blocks: ResumeBlock[];
  createdAt: Date;
  updatedAt: Date;
};

export type InterviewDoc = {
  _id?: any;
  userId: string;
  jobId: string;
  stage: string;
  when?: Date;
  notes?: string;
  questions?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type DebriefDoc = {
  _id?: any;
  userId: string;
  jobId: string;
  interviewers?: string[];
  questions?: string[];
  sentiment?: "bad" | "ok" | "good";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function jobsCollection(dbName?: string): Promise<Collection<JobDoc>> {
  try {
    const db = await connectToDatabase(dbName);
    return db.collection<JobDoc>("jobs");
  } catch (error) {
    console.warn("Using fallback collection for jobs");
    return createFallbackCollection() as any;
  }
}

export async function resumesCollection(dbName?: string): Promise<Collection<ResumeDoc>> {
  try {
    const db = await connectToDatabase(dbName);
    return db.collection<ResumeDoc>("resumes");
  } catch (error) {
    console.warn("Using fallback collection for resumes");
    return createFallbackCollection() as any;
  }
}

export async function interviewsCollection(dbName?: string): Promise<Collection<InterviewDoc>> {
  try {
    const db = await connectToDatabase(dbName);
    return db.collection<InterviewDoc>("interviews");
  } catch (error) {
    console.warn("Using fallback collection for interviews");
    return createFallbackCollection() as any;
  }
}

export async function debriefsCollection(dbName?: string): Promise<Collection<DebriefDoc>> {
  try {
    const db = await connectToDatabase(dbName);
    return db.collection<DebriefDoc>("debriefs");
  } catch (error) {
    console.warn("Using fallback collection for debriefs");
    return createFallbackCollection() as any;
  }
}
