"use client"

import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <p className="text-center text-gray-400 mt-10">Loading profile...</p>
  }

  if (!session) {
    return <p className="text-center text-red-500 mt-10">You must be signed in to view this page.</p>
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="backdrop-blur-xl bg-white/10 p-10 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
        
        <div className="space-y-4">
          <p className="text-white"><strong>Name:</strong> {session.user?.name || "N/A"}</p>
          <p className="text-white"><strong>Email:</strong> {session.user?.email}</p>
          {/* {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile Picture"
              className="w-20 h-20 mx-auto rounded-full border-2 border-white shadow-md"
            />
          )} */}
        </div>

        <button
          onClick={() => signOut()}
          className="mt-8 px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition text-white font-semibold shadow-lg"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  )
}
