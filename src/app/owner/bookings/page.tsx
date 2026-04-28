import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import OwnerStatusSelect from "@/components/OwnerStatusSelect";
import StatusFilter from "@/components/StatusFilter";
import { RENTAL_STATUSES } from "@/lib/bookingStatus";
import { splitRevenue } from "@/lib/commission";

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const ownerId = session!.user.id;
  const sp = await searchParams;
  const status = sp.status;

  const cars = await prisma.car.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const carIds = cars.map((c) => c.id);

  const bookings =
    carIds.length === 0
      ? []
      : await prisma.rentalBooking.findMany({
          where: {
            carId: { in: carIds },
            ...(status ? { status } : {}),
          },
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true, phone: true } } },
        });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-blue-400">
          Đơn thuê trên xe của tôi
        </h2>
        <StatusFilter
          options={RENTAL_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {bookings.length === 0 ? (
          <p className="text-gray-400 p-6">Chua co don nao.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Khách</th>
                <th className="text-left p-4">Xe</th>
                <th className="text-left p-4">Lịch</th>
                <th className="text-right p-4">Tổng đơn</th>
                <th className="text-right p-4">Bạn nhận</th>
                <th className="text-center p-4">TT</th>
                <th className="text-right p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const split = splitRevenue(b.totalPrice, true);
                return (
                  <tr key={b.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-4">
                      <p className="font-medium">{b.user.name || "Khách"}</p>
                      <p className="text-xs text-gray-400">{b.user.email}</p>
                      {b.user.phone && (
                        <a
                          href={`tel:${b.user.phone}`}
                          className="text-xs text-blue-300 hover:underline"
                        >
                          {b.user.phone}
                        </a>
                      )}
                    </td>
                    <td className="p-4">{b.carName}</td>
                    <td className="p-4 text-gray-300">{b.dateRange}</td>
                    <td className="p-4 text-right text-gray-300">
                      {b.totalPrice.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-emerald-400 font-bold">
                        {split.ownerNet.toLocaleString("vi-VN")} đ
                      </p>
                      <p className="text-xs text-gray-500">
                        sau phí {split.platformCommission.toLocaleString("vi-VN")} đ
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      {b.paidAt ? (
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
                      <OwnerStatusSelect
                        id={b.id}
                        initial={b.status}
                        options={RENTAL_STATUSES}
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
