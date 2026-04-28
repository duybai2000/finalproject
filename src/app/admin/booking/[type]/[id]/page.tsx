import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import RefundButton from "@/components/RefundButton";
import { RIDE_STATUSES, RENTAL_STATUSES } from "@/lib/bookingStatus";

function formatDateTime(d: Date | null) {
  return d ? d.toLocaleString("en-US") : "—";
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "ride" && type !== "rental") notFound();

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        driver: { select: { name: true, email: true, phone: true } },
        rating: true,
      },
    });
    if (!ride) notFound();

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
          <span>/</span>
          <span>Ride {ride.id}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Booking">
            <Row label="Booking ID" value={ride.id} />
            <Row label="Created" value={formatDateTime(ride.createdAt)} />
            <Row label="Schedule" value={ride.distance} />
            <Row label="Duration" value={ride.time} />
            <Row
              label="Price"
              value={`${ride.estimatedPrice.toLocaleString("en-US")} VND`}
            />
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 text-sm">Status</span>
              <AdminStatusSelect
                type="ride"
                id={ride.id}
                initial={ride.status}
                options={RIDE_STATUSES}
              />
            </div>
          </Section>

          <Section title="Payment">
            <Row
              label="Paid at"
              value={ride.paidAt ? formatDateTime(ride.paidAt) : "Unpaid"}
            />
            <Row
              label="Refunded at"
              value={ride.refundedAt ? formatDateTime(ride.refundedAt) : "—"}
            />
            {ride.paidAt && !ride.refundedAt && (
              <div className="pt-3">
                <RefundButton type="ride" id={ride.id} />
              </div>
            )}
          </Section>

          <Section title="Customer">
            <Row label="Name" value={ride.user.name || "—"} />
            <Row label="Email" value={ride.user.email || "—"} />
            <Row label="Phone" value={ride.user.phone || "—"} />
          </Section>

          <Section title="Driver">
            {ride.driver ? (
              <>
                <Row label="Name" value={ride.driver.name || "—"} />
                <Row label="Email" value={ride.driver.email || "—"} />
                <Row label="Phone" value={ride.driver.phone || "—"} />
              </>
            ) : (
              <p className="text-gray-400 text-sm">No driver has accepted this ride yet.</p>
            )}
          </Section>

          <Section title="Pickup">
            <Row label="Address" value={ride.pickup} />
            {ride.pickupLat !== null && ride.pickupLng !== null ? (
              <>
                <Row
                  label="GPS"
                  value={`${ride.pickupLat.toFixed(5)}, ${ride.pickupLng.toFixed(5)}`}
                />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${ride.pickupLat}&mlon=${ride.pickupLng}#map=16/${ride.pickupLat}/${ride.pickupLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm inline-flex items-center gap-1"
                >
                  Open in OpenStreetMap
                </a>
              </>
            ) : (
              <p className="text-gray-400 text-sm">No GPS data.</p>
            )}
          </Section>

          {ride.rating && (
            <Section title="Rating">
              <Row label="Score" value={`${ride.rating.score} / 5`} />
              {ride.rating.comment && (
                <p className="text-gray-300 text-sm italic mt-2">
                  &quot;{ride.rating.comment}&quot;
                </p>
              )}
            </Section>
          )}
        </div>
      </div>
    );
  }

  const rental = await prisma.rentalBooking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      rating: true,
    },
  });
  if (!rental) notFound();

  const car = await prisma.car.findUnique({
    where: { id: rental.carId },
    include: {
      owner: { select: { name: true, email: true, phone: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/admin" className="hover:text-white">
          Admin
        </Link>
        <span>/</span>
        <span>Rental {rental.id}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Booking">
          <Row label="Booking ID" value={rental.id} />
          <Row label="Created" value={formatDateTime(rental.createdAt)} />
          <Row label="Car" value={rental.carName} />
          <Row label="Dates" value={rental.dateRange} />
          <Row
            label="Price"
            value={`${rental.totalPrice.toLocaleString("en-US")} VND`}
          />
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-400 text-sm">Status</span>
            <AdminStatusSelect
              type="rental"
              id={rental.id}
              initial={rental.status}
              options={RENTAL_STATUSES}
            />
          </div>
        </Section>

        <Section title="Payment">
          <Row
            label="Paid at"
            value={rental.paidAt ? formatDateTime(rental.paidAt) : "Unpaid"}
          />
          <Row
            label="Refunded at"
            value={
              rental.refundedAt ? formatDateTime(rental.refundedAt) : "—"
            }
          />
          {rental.paidAt && !rental.refundedAt && (
            <div className="pt-3">
              <RefundButton type="rental" id={rental.id} />
            </div>
          )}
        </Section>

        <Section title="Customer">
          <Row label="Name" value={rental.user.name || "—"} />
          <Row label="Email" value={rental.user.email || "—"} />
          <Row label="Phone" value={rental.user.phone || "—"} />
        </Section>

        <Section title="Owner">
          {car?.owner ? (
            <>
              <Row label="Name" value={car.owner.name || "—"} />
              <Row label="Email" value={car.owner.email || "—"} />
              <Row label="Phone" value={car.owner.phone || "—"} />
            </>
          ) : (
            <p className="text-gray-400 text-sm">Platform-owned car.</p>
          )}
        </Section>

        {rental.rating && (
          <Section title="Rating">
            <Row label="Score" value={`${rental.rating.score} / 5`} />
            {rental.rating.comment && (
              <p className="text-gray-300 text-sm italic mt-2">
                &quot;{rental.rating.comment}&quot;
              </p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-right break-words">{value}</span>
    </div>
  );
}
