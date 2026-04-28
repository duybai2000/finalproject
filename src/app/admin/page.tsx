import prisma from "@/lib/prisma";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import { RENTAL_STATUSES, RIDE_STATUSES } from "@/lib/bookingStatus";
import { getRevenueStats } from "@/lib/revenue";

export default async function AdminDashboard() {
  const [usersCount, ridesCount, rentalsCount, rides, rentals, revenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.rideBooking.count(),
      prisma.rentalBooking.count(),
      prisma.rideBooking.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
        take: 50,
      }),
      prisma.rentalBooking.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
        take: 50,
      }),
      getRevenueStats(),
    ]);

  const peak = Math.max(1, ...revenue.daily.map((d) => d.total));

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Khách hàng" value={usersCount} accent="emerald" />
        <StatCard label="Cuốc xe" value={ridesCount} accent="blue" />
        <StatCard label="Đơn thuê xe" value={rentalsCount} accent="orange" />
        <StatCard
          label="Doanh thu tuần"
          value={`${(revenue.thisWeek / 1000).toLocaleString("vi-VN")}K`}
          accent="emerald"
        />
        <StatCard
          label="Tổng doanh thu"
          value={`${(revenue.total / 1000).toLocaleString("vi-VN")}K`}
          accent="emerald"
        />
        <StatCard
          label="Đơn đã TT"
          value={revenue.paidBookings}
          accent="emerald"
        />
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Cơ cấu doanh thu</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
            <p className="text-blue-200/80 text-xs uppercase tracking-wide">
              Doanh thu nền tảng
            </p>
            <p className="text-2xl font-bold text-blue-300 mt-1">
              {revenue.platformDirect.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-xs text-blue-200/60 mt-1">
              Cuốc xe + thuê xe của hệ thống
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
            <p className="text-amber-200/80 text-xs uppercase tracking-wide">
              Phí hoa hồng (15%)
            </p>
            <p className="text-2xl font-bold text-amber-300 mt-1">
              {revenue.commission.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-xs text-amber-200/60 mt-1">
              Từ xe của các chủ xe
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4">
            <p className="text-emerald-200/80 text-xs uppercase tracking-wide">
              Đã chi cho chủ xe
            </p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">
              {revenue.ownerPayouts.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-xs text-emerald-200/60 mt-1">
              85% giá trị đơn của chủ xe
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Doanh thu 7 ngay gan day</h2>
        <div className="grid grid-cols-7 gap-2 items-end h-40">
          {revenue.daily.map((d) => {
            const heightPct = (d.total / peak) * 100;
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 min-h-[2px]"
                    style={{ height: `${Math.max(heightPct, d.total > 0 ? 8 : 2)}%` }}
                    title={`${d.total.toLocaleString("vi-VN")} d`}
                  />
                </div>
                <p className="text-xs text-gray-400">{d.date.slice(5)}</p>
              </div>
            );
          })}
        </div>
        {revenue.total === 0 && (
          <p className="text-sm text-gray-400 mt-3">
            Chua co don nao duoc thanh toan.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-blue-400 mb-4">Quan ly cuoc xe</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          {rides.length === 0 ? (
            <p className="text-gray-400 p-6">Chua co cuoc xe nao.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left p-4">Khach hang</th>
                  <th className="text-left p-4">Lo trinh</th>
                  <th className="text-left p-4">Lich</th>
                  <th className="text-right p-4">Gia</th>
                  <th className="text-center p-4">TT</th>
                  <th className="text-right p-4">Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-4">
                      <p className="font-medium">{ride.user.name || "Khong ten"}</p>
                      <p className="text-xs text-gray-400">{ride.user.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="break-words max-w-xs">
                        {ride.pickup} -&gt; {ride.dropoff}
                      </p>
                    </td>
                    <td className="p-4 text-gray-300">
                      <p>{ride.distance}</p>
                      <p className="text-xs text-gray-400">
                        {ride.time}
                        {ride.distanceKm !== null && ` - ${ride.distanceKm.toFixed(1)} km`}
                      </p>
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-bold">
                      {ride.estimatedPrice.toLocaleString("vi-VN")} d
                    </td>
                    <td className="p-4 text-center">
                      {ride.paidAt ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                          Da TT
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          Chua TT
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <AdminStatusSelect
                        type="ride"
                        id={ride.id}
                        initial={ride.status}
                        options={RIDE_STATUSES}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Quan ly thue xe</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          {rentals.length === 0 ? (
            <p className="text-gray-400 p-6">Chua co don thue xe nao.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left p-4">Khach hang</th>
                  <th className="text-left p-4">Xe</th>
                  <th className="text-left p-4">Lich thue</th>
                  <th className="text-right p-4">Tong</th>
                  <th className="text-center p-4">TT</th>
                  <th className="text-right p-4">Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr
                    key={rental.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="p-4">
                      <p className="font-medium">{rental.user.name || "Khong ten"}</p>
                      <p className="text-xs text-gray-400">{rental.user.email}</p>
                    </td>
                    <td className="p-4">{rental.carName}</td>
                    <td className="p-4 text-gray-300">{rental.dateRange}</td>
                    <td className="p-4 text-right text-emerald-400 font-bold">
                      {rental.totalPrice.toLocaleString("vi-VN")} d
                    </td>
                    <td className="p-4 text-center">
                      {rental.paidAt ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                          Da TT
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          Chua TT
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <AdminStatusSelect
                        type="rental"
                        id={rental.id}
                        initial={rental.status}
                        options={RENTAL_STATUSES}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
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
