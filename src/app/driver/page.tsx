import { Star } from "lucide-react";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getDriverEarnings } from "@/lib/revenue";
import { DRIVER_COMMISSION_RATE } from "@/lib/commission";

export default async function DriverDashboard() {
  const session = await getServerSession(authOptions);
  const driverId = session!.user.id;

  const [pendingCount, myRides, earnings, ratings] = await Promise.all([
    prisma.rideBooking.count({
      where: { status: "PENDING", driverId: null },
    }),
    prisma.rideBooking.findMany({
      where: { driverId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getDriverEarnings(driverId),
    prisma.rating.findMany({
      where: { ride: { driverId } },
      select: { score: true, comment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const ratingAvg =
    ratings.length === 0
      ? null
      : Math.round(
          (ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10
        ) / 10;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Chuyến đang chờ" value={pendingCount} accent="orange" />
        <Stat label="Chuyến của tôi" value={myRides.length} accent="blue" />
        <Stat label="Đã hoàn tất" value={earnings.paidRides} accent="emerald" />
        <Stat
          label="Đã thực nhận"
          value={`${earnings.net.toLocaleString("vi-VN")} đ`}
          accent="emerald"
        />
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide">Đánh giá</h3>
          {ratingAvg === null ? (
            <p className="text-sm text-gray-500 mt-2">Chưa có đánh giá</p>
          ) : (
            <div className="mt-2">
              <p className="text-2xl font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {ratingAvg.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ratings.length} đánh giá
              </p>
            </div>
          )}
        </div>
      </div>

      {ratings.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Đánh giá gần đây</h2>
          <ul className="space-y-3">
            {ratings.slice(0, 5).map((r, i) => (
              <li key={i} className="border-b border-white/5 last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${r.score >= n ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-300 italic">
                    &quot;{r.comment}&quot;
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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
