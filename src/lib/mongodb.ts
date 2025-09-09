import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI as string | undefined;

// Simple connection options that work with all MongoDB versions
const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  retryWrites: true,
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
    throw new Error("MONGODB_URI is not set. Please add it to .env.local");
  }
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw new Error("Failed to connect to database. Please check your MONGODB_URI in .env.local");
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
