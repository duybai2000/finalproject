import prisma from "@/lib/prisma";
import AcceptRideButton from "@/components/AcceptRideButton";

export default async function AvailableRidesPage() {
  const rides = await prisma.rideBooking.findMany({
    where: { status: "PENDING", driverId: null },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-400">Rides waiting for a driver</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {rides.length === 0 ? (
          <p className="text-gray-400 p-6">
            No rides waiting. Check back later.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Pickup</th>
                <th className="text-left p-4">Schedule</th>
                <th className="text-right p-4">Price</th>
                <th className="text-right p-4">You receive (90%)</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const driverNet = Math.round(ride.estimatedPrice * 0.9);
                return (
                  <tr key={ride.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-4">
                      <p className="font-medium">{ride.user.name || "Customer"}</p>
                    </td>
                    <td className="p-4">
                      <p className="break-words max-w-xs">{ride.pickup}</p>
                    </td>
                    <td className="p-4 text-gray-300">
                      <p>{ride.distance}</p>
                      <p className="text-xs text-gray-400">{ride.time}</p>
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      {ride.estimatedPrice.toLocaleString("en-US")} VND
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-bold">
                      {driverNet.toLocaleString("en-US")} VND
                    </td>
                    <td className="p-4">
                      <AcceptRideButton id={ride.id} />
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
