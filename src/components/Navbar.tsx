"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, Car } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Ride & Rent
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white transition">Trang chủ</Link>
          <Link href="/about" className="hover:text-white transition">Giới thiệu</Link>
          <Link href="/contact" className="hover:text-white transition">Liên hệ</Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
               <Link href="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                 <User className="w-5 h-5" />
                 <span className="hidden sm:inline">({session.user.role}) {session.user.name}</span>
               </Link>

               {session.user.role === 'ADMIN' && (
                 <Link
                   href="/admin"
                   className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-1.5 rounded-lg font-semibold transition shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                 >
                   <LayoutDashboard className="w-5 h-5" />
                   <span>Admin</span>
                 </Link>
               )}

               {session.user.role === 'OWNER' && (
                 <Link
                   href="/owner"
                   className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3 py-1.5 rounded-lg font-semibold transition shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                 >
                   <Car className="w-5 h-5" />
                   <span>Chủ xe</span>
                 </Link>
               )}

               <button onClick={() => signOut()} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition">
                 <LogOut className="w-5 h-5" />
                 <span className="hidden sm:inline">Đăng Xuất</span>
               </button>
            </>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Đăng Nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
