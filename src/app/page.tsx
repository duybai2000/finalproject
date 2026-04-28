"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Navigation, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import RideForm from "@/components/RideForm";
import RentalForm from "@/components/RentalForm";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"ride" | "rent">("ride");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.role === "OWNER";
  const isDriver = session?.user?.role === "DRIVER";

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={activeTab === "ride" 
            ? "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920" 
            : "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920&blur=2"
          } 
          alt="Background" 
          className="w-full h-full object-cover opacity-30 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900 z-10" />
      </div>

      <main className="relative z-20 flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 pb-32 min-h-screen">
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto mb-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-md px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-emerald-300" />
              <div>
                <p className="text-emerald-100 font-semibold">
                  Bạn đang đăng nhập với vai trò Admin
                </p>
                <p className="text-emerald-200/70 text-sm">
                  Vào trang quản trị để xem dashboard, quản lý xe và người dùng.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl text-sm whitespace-nowrap"
            >
              Mở Admin
            </Link>
          </motion.div>
        )}

        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto mb-8 rounded-2xl border border-amber-400/30 bg-amber-500/10 backdrop-blur-md px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-amber-100 font-semibold">
                  Bạn đang đăng nhập với vai trò Chủ xe
                </p>
                <p className="text-amber-200/70 text-sm">
                  Quản lý xe cho thuê và đơn thuê trong bảng điều khiển chủ xe.
                </p>
              </div>
            </div>
            <Link
              href="/owner"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-sm whitespace-nowrap"
            >
              Mở bảng chủ xe
            </Link>
          </motion.div>
        )}

        {isDriver && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto mb-8 rounded-2xl border border-purple-400/30 bg-purple-500/10 backdrop-blur-md px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-purple-300" />
              <div>
                <p className="text-purple-100 font-semibold">
                  Bạn đang đăng nhập với vai trò Tài xế
                </p>
                <p className="text-purple-200/70 text-sm">
                  Nhận chuyến từ khách hàng và theo dõi thu nhập của bạn.
                </p>
              </div>
            </div>
            <Link
              href="/driver"
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-xl text-sm whitespace-nowrap"
            >
              Mở bảng tài xế
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight mb-4">
            Di Chuyển Thông Minh
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Giải pháp di chuyển toàn diện. Lựa chọn đặt xe đi ngay hoặc thuê xe tự lái với dàn xe chất lượng cao.
          </p>
        </motion.div>

        {/* Custom Tab Toggle */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex gap-2 mb-12 relative shadow-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("ride")}
            className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === "ride" ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Navigation className="w-5 h-5" />
            Gọi Tài Xế
          </button>
          <button
            onClick={() => setActiveTab("rent")}
            className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === "rent" ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Car className="w-5 h-5" />
            Thuê Xe Tự Lái
          </button>

          {/* Active indicator */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-blue-600 rounded-xl transition-all duration-300 ease-out shadow-lg ${
              activeTab === "ride" ? "left-1.5" : "left-[calc(50%+0.1875rem)]"
            }`}
          />
        </div>

        {/* Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "ride" ? (
              <motion.div
                key="ride"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <RideForm />
              </motion.div>
            ) : (
              <motion.div
                key="rent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RentalForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
