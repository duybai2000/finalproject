import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

  const activeCars = cars.filter((c) => c.active).length;
  const totalEarnings = bookings
    .filter((b) => b.paidAt)
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const pending = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Tong xe" value={cars.length} accent="emerald" />
        <Stat label="Xe dang hoat dong" value={activeCars} accent="blue" />
        <Stat label="Don dang cho" value={pending} accent="orange" />
        <Stat
          label="Doanh thu"
          value={`${(totalEarnings / 1000).toLocaleString("vi-VN")}K`}
          accent="emerald"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Xin chao, {session!.user.name || "chu xe"}!</h2>
        <p className="text-gray-400 text-sm">
          Tu day ban co the dang xe cho thue, theo doi don thue va xem doanh thu.
          Vao &quot;Xe cua toi&quot; de them xe moi, hoac &quot;Don thue&quot; de xac nhan don.
        </p>
      </div>

      {bookings.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">5 don gan day</h2>
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
                    {b.totalPrice.toLocaleString("vi-VN")} d
                  </p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{b.status}</span>
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
