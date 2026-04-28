import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getOwnerDailyRevenue, getOwnerEarnings } from "@/lib/revenue";
import { PLATFORM_COMMISSION_RATE } from "@/lib/commission";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  const ownerId = session!.user.id;

  const cars = await prisma.car.findMany({ where: { ownerId } });
  const ownedCarIds = cars.map((c) => c.id);
  const bookings =
    ownedCarIds.length === 0
      ? []
      : await prisma.rentalBooking.findMany({
          where: { carId: { in: ownedCarIds } },
          orderBy: { createdAt: "desc" },
        });

  const [earnings, daily] = await Promise.all([
    getOwnerEarnings(ownerId),
    getOwnerDailyRevenue(ownerId),
  ]);
  const peak = Math.max(1, ...daily.map((d) => d.total));
  const activeCars = cars.filter((c) => c.active).length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total cars" value={cars.length} accent="blue" />
        <Stat label="Active" value={activeCars} accent="emerald" />
        <Stat label="Pending bookings" value={pending} accent="orange" />
        <Stat
          label="Net earnings"
          value={`${earnings.net.toLocaleString("en-US")} VND`}
          accent="emerald"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Total earnings</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wide">
              Gross revenue
            </p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {earnings.gross.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {earnings.paidBookings} paid bookings
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wide">
              Platform fee ({(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%)
            </p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              -{earnings.commission.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-gray-500 mt-1">Auto-deducted</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-400/30">
            <p className="text-emerald-200/80 text-xs uppercase tracking-wide">
              Net to you
            </p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">
              {earnings.net.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-emerald-200/60 mt-1">
              {(100 - PLATFORM_COMMISSION_RATE * 100).toFixed(0)}% after fees
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">
          Hello, {session!.user.name || "Owner"}
        </h2>
        <p className="text-gray-400 text-sm">
          Manage your listed cars and incoming bookings here. For each paid
          booking you receive{" "}
          {(100 - PLATFORM_COMMISSION_RATE * 100).toFixed(0)}% of the total —
          the rest is the platform&apos;s service fee.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Net earnings — last 7 days
        </h2>
        <div className="grid grid-cols-7 gap-2 items-end h-40">
          {daily.map((d) => {
            const heightPct = (d.total / peak) * 100;
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 min-h-[2px]"
                    style={{
                      height: `${Math.max(heightPct, d.total > 0 ? 8 : 2)}%`,
                    }}
                    title={`${d.total.toLocaleString("en-US")} VND`}
                  />
                </div>
                <p className="text-xs text-gray-400">{d.date.slice(5)}</p>
              </div>
            );
          })}
        </div>
        {daily.every((d) => d.total === 0) && (
          <p className="text-sm text-gray-400 mt-3">
            No paid bookings in the last 7 days.
          </p>
        )}
      </div>

      {bookings.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent bookings</h2>
          <ul className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <li
                key={b.id}
                className="flex justify-between items-center text-sm border-b border-white/5 last:border-b-0 pb-2 last:pb-0"
              >
                <div>
                  <p className="font-medium">{b.carName}</p>
                  <p className="text-gray-400 text-xs">{b.dateRange}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">
                    {b.totalPrice.toLocaleString("en-US")} VND
                  </p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {b.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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
