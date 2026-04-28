import Link from "next/link";
import prisma from "@/lib/prisma";
import DeleteCarButton from "@/components/DeleteCarButton";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-400">Danh sach xe</h2>
        <Link
          href="/admin/cars/new"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-xl"
        >
          + Them xe moi
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {cars.length === 0 ? (
          <p className="text-gray-400 p-6">Chua co xe nao.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Anh</th>
                <th className="text-left p-4">Ten</th>
                <th className="text-left p-4">Loai</th>
                <th className="text-center p-4">Cho</th>
                <th className="text-center p-4">So</th>
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
                  <td className="p-4 text-center">{car.auto ? "TD" : "Tay"}</td>
                  <td className="p-4 text-right text-emerald-400 font-bold">
                    {car.dailyRate.toLocaleString("vi-VN")} d
                  </td>
                  <td className="p-4 text-center">
                    {car.active ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                        Hoat dong
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
                        href={`/admin/cars/${car.id}/edit`}
                        className="text-xs text-blue-300 hover:text-blue-200"
                      >
                        Sua
                      </Link>
                      <DeleteCarButton id={car.id} name={car.name} />
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
