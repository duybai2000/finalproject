"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Thông tin đăng nhập không chính xác");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    const target = role === "ADMIN" ? "/admin" : role === "OWNER" ? "/owner" : "/";
    router.push(target);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative z-10 w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">Đăng Nhập</h2>
        <p className="text-gray-400 text-center mb-8">Chào mừng bạn trở lại hệ thống</p>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
             <label className="block text-gray-300 text-sm font-medium mb-1">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-4 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            Đăng Nhập
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Chưa có tài khoản? <Link href="/register" className="text-blue-400 hover:underline">Đăng ký ngay</Link>
        </p>
      </motion.div>
    </div>
  );
}
