// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import clientPromise from "@/lib/mongodb";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcrypt";

// export const authOptions = {
//   adapter: MongoDBAdapter(clientPromise),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const client = await clientPromise;
//         const db = client.db(process.env.MONGODB_DB);
//         const user = await db.collection("users").findOne({ email: credentials.email });

//         if (!user) return null;

//         const isPasswordValid = await compare(credentials.password, user.password);
//         if (!isPasswordValid) return null;

//         return {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//         };
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   pages: {
//     signIn: "/auth/signin",
//   },
// };
import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);
  return hashedPassword;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}
