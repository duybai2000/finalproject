import Link from "next/link";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import OwnerDeleteCarButton from "@/components/OwnerDeleteCarButton";

export default async function OwnerCarsPage() {
  const session = await getServerSession(authOptions);
  const cars = await prisma.car.findMany({
    where: { ownerId: session!.user.id },
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-400">Xe cua toi</h2>
        <Link
          href="/owner/cars/new"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-xl"
        >
          + Dang xe moi
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {cars.length === 0 ? (
          <div className="p-6 text-gray-400">
            <p>Ban chua dang xe nao.</p>
            <p className="text-sm mt-1">
              Bam &quot;Dang xe moi&quot; de bat dau cho thue chiec xe dau tien.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Anh</th>
                <th className="text-left p-4">Ten</th>
                <th className="text-left p-4">Loai</th>
                <th className="text-center p-4">Cho</th>
                <th className="text-right p-4">Don gia</th>
                <th className="text-center p-4">Trang thai</th>
                <th className="text-right p-4">Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-b border-white/5 last:border-b-0">
                  <td className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-20 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-4 font-medium">{car.name}</td>
                  <td className="p-4 text-gray-300">{car.type}</td>
                  <td className="p-4 text-center">{car.seats}</td>
                  <td className="p-4 text-right text-emerald-400 font-bold">
                    {car.dailyRate.toLocaleString("vi-VN")} d
                  </td>
                  <td className="p-4 text-center">
                    {car.active ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                        Cho thue
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                        Tat
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-3">
                      <Link
                        href={`/owner/cars/${car.id}/edit`}
                        className="text-xs text-blue-300 hover:text-blue-200"
                      >
                        Sua
                      </Link>
                      <OwnerDeleteCarButton id={car.id} name={car.name} />
                    </div>
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
