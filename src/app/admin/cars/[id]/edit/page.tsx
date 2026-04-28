import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CarForm from "@/components/CarForm";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const carId = Number(id);
  if (!Number.isInteger(carId) || carId <= 0) notFound();

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400">Sua xe: {car.name}</h2>
      <CarForm
        mode="edit"
        carId={car.id}
        initial={{
          name: car.name,
          type: car.type,
          seats: car.seats,
          auto: car.auto,
          dailyRate: car.dailyRate,
          img: car.img,
          active: car.active,
        }}
      />
    </div>
  );
}
