import Link from "next/link";
import prisma from "@/lib/prisma";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import StatusFilter from "@/components/StatusFilter";
import { RENTAL_STATUSES, RIDE_STATUSES } from "@/lib/bookingStatus";
import { getRevenueStats } from "@/lib/revenue";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ rideStatus?: string; rentalStatus?: string }>;
}) {
  const sp = await searchParams;
  const { rideStatus, rentalStatus } = sp;

  const [usersCount, ridesCount, rentalsCount, rides, rentals, revenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.rideBooking.count(),
      prisma.rentalBooking.count(),
      prisma.rideBooking.findMany({
        where: rideStatus ? { status: rideStatus } : undefined,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
        take: 50,
      }),
      prisma.rentalBooking.findMany({
        where: rentalStatus ? { status: rentalStatus } : undefined,
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
        <StatCard label="Customers" value={usersCount} accent="emerald" />
        <StatCard label="Rides" value={ridesCount} accent="blue" />
        <StatCard label="Rentals" value={rentalsCount} accent="orange" />
        <StatCard
          label="Revenue (7d)"
          value={`${(revenue.thisWeek / 1000).toLocaleString("en-US")}K`}
          accent="emerald"
        />
        <StatCard
          label="Total revenue"
          value={`${(revenue.total / 1000).toLocaleString("en-US")}K`}
          accent="emerald"
        />
        <StatCard
          label="Paid bookings"
          value={revenue.paidBookings}
          accent="emerald"
        />
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Revenue breakdown</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
            <p className="text-blue-200/80 text-xs uppercase tracking-wide">
              Platform revenue
            </p>
            <p className="text-2xl font-bold text-blue-300 mt-1">
              {revenue.platformDirect.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-blue-200/60 mt-1">
              Platform fleet rentals + unclaimed rides
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
            <p className="text-amber-200/80 text-xs uppercase tracking-wide">
              Commission
            </p>
            <p className="text-2xl font-bold text-amber-300 mt-1">
              {revenue.commission.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-amber-200/60 mt-1">
              15% from owner cars + 10% from drivers
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4">
            <p className="text-emerald-200/80 text-xs uppercase tracking-wide">
              Paid to owners
            </p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">
              {revenue.ownerPayouts.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-emerald-200/60 mt-1">
              85% of owner-listed bookings
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
            <p className="text-purple-200/80 text-xs uppercase tracking-wide">
              Paid to drivers
            </p>
            <p className="text-2xl font-bold text-purple-300 mt-1">
              {revenue.driverPayouts.toLocaleString("en-US")} VND
            </p>
            <p className="text-xs text-purple-200/60 mt-1">
              90% of driver-claimed rides
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Revenue last 7 days</h2>
        <div className="grid grid-cols-7 gap-2 items-end h-40">
          {revenue.daily.map((d) => {
            const heightPct = (d.total / peak) * 100;
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 min-h-[2px]"
                    style={{ height: `${Math.max(heightPct, d.total > 0 ? 8 : 2)}%` }}
                    title={`${d.total.toLocaleString("en-US")} VND`}
                  />
                </div>
                <p className="text-xs text-gray-400">{d.date.slice(5)}</p>
              </div>
            );
          })}
        </div>
        {revenue.total === 0 && (
          <p className="text-sm text-gray-400 mt-3">
            No paid bookings yet.
          </p>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-blue-400">Rides</h2>
          <StatusFilter
            paramName="rideStatus"
            options={RIDE_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          {rides.length === 0 ? (
            <p className="text-gray-400 p-6">No rides yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Pickup</th>
                  <th className="text-left p-4">Schedule</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-center p-4">Paid</th>
                  <th className="text-right p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                    <td className="p-4">
                      <Link href={`/admin/booking/ride/${ride.id}`} className="font-medium hover:text-blue-300">
                        {ride.user.name || "No name"}
                      </Link>
                      <p className="text-xs text-gray-400">{ride.user.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="break-words max-w-xs">{ride.pickup}</p>
                    </td>
                    <td className="p-4 text-gray-300">
                      <p>{ride.distance}</p>
                      <p className="text-xs text-gray-400">{ride.time}</p>
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-bold">
                      {ride.estimatedPrice.toLocaleString("en-US")} VND
                    </td>
                    <td className="p-4 text-center">
                      {ride.paidAt ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                          Paid
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          Unpaid
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-orange-400">Rentals</h2>
          <StatusFilter
            paramName="rentalStatus"
            options={RENTAL_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          {rentals.length === 0 ? (
            <p className="text-gray-400 p-6">No rentals yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Car</th>
                  <th className="text-left p-4">Dates</th>
                  <th className="text-right p-4">Total</th>
                  <th className="text-center p-4">Paid</th>
                  <th className="text-right p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr
                    key={rental.id}
                    className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <Link href={`/admin/booking/rental/${rental.id}`} className="font-medium hover:text-blue-300">
                        {rental.user.name || "No name"}
                      </Link>
                      <p className="text-xs text-gray-400">{rental.user.email}</p>
                    </td>
                    <td className="p-4">{rental.carName}</td>
                    <td className="p-4 text-gray-300">{rental.dateRange}</td>
                    <td className="p-4 text-right text-emerald-400 font-bold">
                      {rental.totalPrice.toLocaleString("en-US")} VND
                    </td>
                    <td className="p-4 text-center">
                      {rental.paidAt ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                          Paid
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          Unpaid
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
