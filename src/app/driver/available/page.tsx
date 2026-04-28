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
      <h2 className="text-2xl font-bold text-purple-400">Chuyến đang chờ tài xế</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {rides.length === 0 ? (
          <p className="text-gray-400 p-6">
            Chưa có chuyến nào đang chờ. Quay lại sau.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Khách</th>
                <th className="text-left p-4">Lộ trình</th>
                <th className="text-left p-4">Lịch</th>
                <th className="text-right p-4">Giá đơn</th>
                <th className="text-right p-4">Bạn nhận (90%)</th>
                <th className="text-right p-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const driverNet = Math.round(ride.estimatedPrice * 0.9);
                return (
                  <tr key={ride.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-4">
                      <p className="font-medium">{ride.user.name || "Khách"}</p>
                    </td>
                    <td className="p-4">
                      <p className="break-words max-w-xs">
                        {ride.pickup} → {ride.dropoff}
                      </p>
                    </td>
                    <td className="p-4 text-gray-300">
                      <p>{ride.distance}</p>
                      <p className="text-xs text-gray-400">{ride.time}</p>
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      {ride.estimatedPrice.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-bold">
                      {driverNet.toLocaleString("vi-VN")} đ
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
