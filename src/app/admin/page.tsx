import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/"); // Not authorized
  }

  const usersCount = await prisma.user.count();
  const ridesCount = await prisma.rideBooking.count();
  const rentalsCount = await prisma.rentalBooking.count();

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-gray-400">Khách hàng</h3>
            <p className="text-4xl font-bold mt-2 text-emerald-400">{usersCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-gray-400">Cuốc Xe Đặt</h3>
            <p className="text-4xl font-bold mt-2 text-blue-400">{ridesCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-gray-400">Đơn Thuê Xe</h3>
            <p className="text-4xl font-bold mt-2 text-orange-400">{rentalsCount}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Quản lý nâng cao</h2>
          <p className="text-gray-400">Bạn là Admin hệ thống. Ở phần này bạn có thể bổ sung chức năng xem cụ thể từng danh sách hoặc xuất báo cáo.</p>
        </div>
      </div>
    </div>
  );
}
