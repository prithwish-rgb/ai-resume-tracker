"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("⚠️ Please enter both email and password.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });

    if (result?.error) {
      alert("❌ Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-[#6C63FF] via-[#00C9A7] to-[#6C63FF] text-white">
      {/* Navbar space */}
      <div className="pt-20 flex flex-1 items-center justify-center">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
          <h1 className="text-4xl font-extrabold mb-4 tracking-wide">
            Welcome👋
          </h1>
          <p className="text-gray-200 mb-6">
            Sign in to continue with{" "}
            <span className="font-bold">AI Resume Tracker</span>
          </p>

          {/* Credentials (Email + Password) */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none border border-white/20"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none border border-white/20"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-semibold rounded-xl shadow-lg transition transform ${
                loading
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-[#00C9A7] text-black hover:scale-105"
              }`}
            >
              {loading ? "Signing in..." : "Sign in with Email"}
            </button>
          </form>

          <div className="space-y-4 mt-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl shadow-lg hover:scale-105 transition transform"
            >
              Sign in with Google
            </button>

            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition transform border border-white/20"
            >
              Sign in with GitHub
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            Don’t have an account?{" "}
            <a
              href="/auth/register"
              className="text-white font-semibold underline hover:text-gray-200"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
