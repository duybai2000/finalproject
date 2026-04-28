import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import DriverStatusSelect from "@/components/DriverStatusSelect";
import { RIDE_STATUSES } from "@/lib/bookingStatus";
import { splitRideRevenue } from "@/lib/commission";

export default async function DriverMyRidesPage() {
  const session = await getServerSession(authOptions);
  const rides = await prisma.rideBooking.findMany({
    where: { driverId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-400">Chuyến của tôi</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {rides.length === 0 ? (
          <p className="text-gray-400 p-6">
            Bạn chưa nhận chuyến nào. Vào tab &quot;Chuyến đang chờ&quot; để nhận.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Khách</th>
                <th className="text-left p-4">Điểm đón</th>
                <th className="text-left p-4">Lịch</th>
                <th className="text-right p-4">Bạn nhận</th>
                <th className="text-center p-4">TT</th>
                <th className="text-right p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const split = splitRideRevenue(ride.estimatedPrice, true);
                return (
                  <tr key={ride.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-4">
                      <p className="font-medium">{ride.user.name || "Khách"}</p>
                      <p className="text-xs text-gray-400">{ride.user.email}</p>
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
                        {split.driverNet.toLocaleString("vi-VN")} đ
                      </p>
                      <p className="text-xs text-gray-500">
                        sau phí {split.platformCommission.toLocaleString("vi-VN")} đ
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      {ride.paidAt ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                          Đã TT
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          Chưa TT
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
