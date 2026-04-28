"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Role = "USER" | "OWNER" | "DRIVER";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative z-10 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
        <p className="text-gray-400 text-center mb-8">Join Ride &amp; Rent</p>

        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">I am signing up as</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`p-3 rounded-xl text-sm font-semibold transition border ${
                  role === "USER"
                    ? "bg-blue-600/30 border-blue-400 text-white"
                    : "bg-slate-900/50 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                <div>Customer</div>
                <div className="text-xs font-normal mt-1 opacity-70">Hire drivers / rent cars</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`p-3 rounded-xl text-sm font-semibold transition border ${
                  role === "OWNER"
                    ? "bg-emerald-600/30 border-emerald-400 text-white"
                    : "bg-slate-900/50 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                <div>Car owner</div>
                <div className="text-xs font-normal mt-1 opacity-70">List my own car</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("DRIVER")}
                className={`p-3 rounded-xl text-sm font-semibold transition border ${
                  role === "DRIVER"
                    ? "bg-purple-600/30 border-purple-400 text-white"
                    : "bg-slate-900/50 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                <div>Driver</div>
                <div className="text-xs font-normal mt-1 opacity-70">Pick up rides</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0901234567"
              className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="[0-9+\s().-]{8,20}"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition mt-4 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            {submitting ? "Submitting..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
