import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import DriverStatusSelect from "@/components/DriverStatusSelect";
import StatusFilter from "@/components/StatusFilter";
import { RIDE_STATUSES } from "@/lib/bookingStatus";
import { splitRideRevenue } from "@/lib/commission";

export default async function DriverMyRidesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;
  const status = sp.status;

  const rides = await prisma.rideBooking.findMany({
    where: {
      driverId: session!.user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-purple-400">My rides</h2>
        <StatusFilter
          options={RIDE_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {rides.length === 0 ? (
          <p className="text-gray-400 p-6">
            You haven&apos;t accepted any rides yet. Go to &quot;Available rides&quot; to pick one up.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Pickup</th>
                <th className="text-left p-4">Schedule</th>
                <th className="text-right p-4">You receive</th>
                <th className="text-center p-4">Paid</th>
                <th className="text-right p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const split = splitRideRevenue(ride.estimatedPrice, true);
                return (
                  <tr key={ride.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-4">
                      <p className="font-medium">{ride.user.name || "Customer"}</p>
                      <p className="text-xs text-gray-400">{ride.user.email}</p>
                      {ride.user.phone && (
                        <a
                          href={`tel:${ride.user.phone}`}
                          className="text-xs text-blue-300 hover:underline"
                        >
                          {ride.user.phone}
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="break-words max-w-xs">{ride.pickup}</p>
                    </td>
                    <td className="p-4 text-gray-300">
                      <p>{ride.distance}</p>
                      <p className="text-xs text-gray-400">{ride.time}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-emerald-400 font-bold">
                        {split.driverNet.toLocaleString("en-US")} VND
                      </p>
                      <p className="text-xs text-gray-500">
                        after fee {split.platformCommission.toLocaleString("en-US")} VND
                      </p>
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
                      <DriverStatusSelect
                        id={ride.id}
                        initial={ride.status}
                        options={RIDE_STATUSES}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
