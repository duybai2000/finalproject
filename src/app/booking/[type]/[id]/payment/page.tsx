import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import PaymentForm from "@/components/PaymentForm";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  if (type !== "ride" && type !== "rental") notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({ where: { id } });
    if (!ride || ride.userId !== userId) notFound();

    if (ride.paidAt) {
      redirect(`/booking/ride/${id}`);
    }

    return (
      <PaymentForm
        type="ride"
        id={ride.id}
        amount={ride.estimatedPrice}
        label={`Driver hire from ${ride.pickup}`}
      />
    );
  }

  const rental = await prisma.rentalBooking.findUnique({ where: { id } });
  if (!rental || rental.userId !== userId) notFound();

  if (rental.paidAt) {
    redirect(`/booking/rental/${id}`);
  }

  return (
    <PaymentForm
      type="rental"
      id={rental.id}
      amount={rental.totalPrice}
      label={`Car rental: ${rental.carName}`}
    />
  );
}
