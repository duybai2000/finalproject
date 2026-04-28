import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getDriverEarnings } from "@/lib/revenue";
import { DRIVER_COMMISSION_RATE } from "@/lib/commission";

export default async function DriverDashboard() {
  const session = await getServerSession(authOptions);
  const driverId = session!.user.id;

  const [pendingCount, myRides, earnings] = await Promise.all([
    prisma.rideBooking.count({
      where: { status: "PENDING", driverId: null },
    }),
    prisma.rideBooking.findMany({
      where: { driverId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getDriverEarnings(driverId),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Chuyến đang chờ" value={pendingCount} accent="orange" />
        <Stat label="Chuyến của tôi" value={myRides.length} accent="blue" />
        <Stat label="Đã hoàn tất" value={earnings.paidRides} accent="emerald" />
        <Stat
          label="Đã thực nhận"
          value={`${earnings.net.toLocaleString("vi-VN")} đ`}
          accent="emerald"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Thu nhập của bạn</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wide">
              Tổng doanh thu
            </p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {earnings.gross.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {earnings.paidRides} chuyến đã thanh toán
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wide">
              Phí nền tảng ({(DRIVER_COMMISSION_RATE * 100).toFixed(0)}%)
            </p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              -{earnings.commission.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-xs text-gray-500 mt-1">Tự động khấu trừ</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-400/30">
            <p className="text-emerald-200/80 text-xs uppercase tracking-wide">
              Thực nhận
            </p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">
              {earnings.net.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-xs text-emerald-200/60 mt-1">
              {(100 - DRIVER_COMMISSION_RATE * 100).toFixed(0)}% sau phí
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">
          Xin chào, {session!.user.name || "tài xế"}
        </h2>
        <p className="text-gray-400 text-sm">
          Vào &quot;Chuyến đang chờ&quot; để nhận chuyến mới. Mỗi chuyến hoàn
          tất, bạn nhận{" "}
          {(100 - DRIVER_COMMISSION_RATE * 100).toFixed(0)}% giá trị đơn — phần
          còn lại là phí dịch vụ của nền tảng.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "emerald" | "blue" | "orange";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "blue"
        ? "text-blue-400"
        : "text-orange-400";
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
      <h3 className="text-xs text-gray-400 uppercase tracking-wide">{label}</h3>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
