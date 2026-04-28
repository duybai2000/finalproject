import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import OwnerStatusSelect from "@/components/OwnerStatusSelect";
import { RENTAL_STATUSES } from "@/lib/bookingStatus";

export default async function OwnerBookingsPage() {
  const session = await getServerSession(authOptions);
  const ownerId = session!.user.id;

  const cars = await prisma.car.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const carIds = cars.map((c) => c.id);

  const bookings =
    carIds.length === 0
      ? []
      : await prisma.rentalBooking.findMany({
          where: { carId: { in: carIds } },
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400">Don thue tren xe cua toi</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {bookings.length === 0 ? (
          <p className="text-gray-400 p-6">Chua co don nao.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Khach</th>
                <th className="text-left p-4">Xe</th>
                <th className="text-left p-4">Lich</th>
                <th className="text-right p-4">Tong</th>
                <th className="text-center p-4">TT</th>
                <th className="text-right p-4">Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 last:border-b-0">
                  <td className="p-4">
                    <p className="font-medium">{b.user.name || "Khong ten"}</p>
                    <p className="text-xs text-gray-400">{b.user.email}</p>
                  </td>
                  <td className="p-4">{b.carName}</td>
                  <td className="p-4 text-gray-300">{b.dateRange}</td>
                  <td className="p-4 text-right text-emerald-400 font-bold">
                    {b.totalPrice.toLocaleString("vi-VN")} d
                  </td>
                  <td className="p-4 text-center">
                    {b.paidAt ? (
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
                    <OwnerStatusSelect
                      id={b.id}
                      initial={b.status}
                      options={RENTAL_STATUSES}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
