import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import BackLink from "@/components/BackLink";

type Params = Promise<{ type: string; id: string }>;

function PaidBadge({ paidAt }: { paidAt: Date | null }) {
  if (paidAt) {
    return (
      <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded">
        Paid {paidAt.toLocaleDateString("en-US")}
      </span>
    );
  }
  return (
    <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
      Unpaid
    </span>
  );
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: Params;
}) {
  const { type, id } = await params;

  if (type !== "ride" && type !== "rental") {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({
      where: { id },
      include: {
        driver: { select: { name: true, phone: true } },
      },
    });
    if (!ride || ride.userId !== userId) notFound();

    return (
      <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <BackLink href="/profile" label="Back to my bookings" />
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 mb-6">
            <h1 className="text-2xl font-bold text-emerald-200">
              {ride.paidAt
                ? "Payment successful"
                : "Booking confirmed"}
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1">Booking ID: {ride.id}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <h2 className="text-lg font-semibold">Ride details</h2>
              <PaidBadge paidAt={ride.paidAt} />
            </div>
            <p>
              <span className="text-gray-400">Pickup: </span>
              {ride.pickup}
            </p>
            <p>
              <span className="text-gray-400">Schedule: </span>
              {ride.distance}
            </p>
            <p>
              <span className="text-gray-400">Duration: </span>
              {ride.time}
            </p>
            <p>
              <span className="text-gray-400">Total: </span>
              <span className="text-emerald-400 font-bold">
                {ride.estimatedPrice.toLocaleString("en-US")} VND
              </span>
            </p>
            <p>
              <span className="text-gray-400">Status: </span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {ride.status}
              </span>
            </p>

            {ride.driver ? (
              <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
                <p className="text-sm text-emerald-200 font-semibold">
                  Driver assigned
                </p>
                <p>
                  <span className="text-gray-400">Name: </span>
                  {ride.driver.name || "Not set"}
                </p>
                <p>
                  <span className="text-gray-400">Phone: </span>
                  {ride.driver.phone ? (
                    <a
                      href={`tel:${ride.driver.phone}`}
                      className="text-blue-300 hover:underline"
                    >
                      {ride.driver.phone}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 pt-2">
                Looking for an available driver. You&apos;ll get the driver&apos;s
                contact details as soon as one accepts the ride.
              </p>
            )}

            {ride.paidAt && (
              <p className="text-sm text-gray-400 pt-2 border-t border-white/10 mt-2">
                Thanks for completing your payment.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {!ride.paidAt && (
              <Link
                href={`/booking/ride/${ride.id}/payment`}
                className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Pay now
              </Link>
            )}
            <Link
              href="/profile"
              className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              View history
            </Link>
            <Link
              href="/"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rental = await prisma.rentalBooking.findUnique({ where: { id } });
  if (!rental || rental.userId !== userId) notFound();

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <BackLink href="/profile" label="Back to my bookings" />
        </div>

        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 mb-6">
          <h1 className="text-2xl font-bold text-emerald-200">
            {rental.paidAt
              ? "Payment successful"
              : "Rental booked"}
          </h1>
          <p className="text-sm text-emerald-100/80 mt-1">Booking ID: {rental.id}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-start gap-3">
            <h2 className="text-lg font-semibold">Rental details</h2>
            <PaidBadge paidAt={rental.paidAt} />
          </div>
          <p>
            <span className="text-gray-400">Car: </span>
            {rental.carName}
          </p>
          <p>
            <span className="text-gray-400">Dates: </span>
            {rental.dateRange}
          </p>
          <p>
            <span className="text-gray-400">Total: </span>
            <span className="text-emerald-400 font-bold">
              {rental.totalPrice.toLocaleString("en-US")} VND
            </span>
          </p>
          <p>
            <span className="text-gray-400">Status: </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {rental.status}
            </span>
          </p>
          <p className="text-sm text-gray-400 pt-2">
            {rental.paidAt
              ? "Thanks for completing your payment."
              : "The owner will confirm your booking shortly."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {!rental.paidAt && (
            <Link
              href={`/booking/rental/${rental.id}/payment`}
              className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Pay now
            </Link>
          )}
          <Link
            href="/profile"
            className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            View history
          </Link>
          <Link
            href="/"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
