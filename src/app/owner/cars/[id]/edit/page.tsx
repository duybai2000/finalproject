import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import OwnerCarForm from "@/components/OwnerCarForm";

export default async function EditOwnerCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const carId = Number(id);
  if (!Number.isInteger(carId) || carId <= 0) notFound();

  const session = await getServerSession(authOptions);
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || car.ownerId !== session!.user.id) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400">Sua xe: {car.name}</h2>
      <OwnerCarForm
        mode="edit"
        carId={car.id}
        initial={{
          name: car.name,
          type: car.type,
          seats: car.seats,
          auto: car.auto,
          dailyRate: car.dailyRate,
          img: car.img,
          description: car.description ?? "",
          active: car.active,
        }}
      />
    </div>
  );
}
