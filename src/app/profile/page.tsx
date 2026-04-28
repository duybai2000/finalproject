import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Star } from "lucide-react";
import CancelBookingButton from "@/components/CancelBookingButton";
import EditProfileForm from "@/components/EditProfileForm";
import RatingForm from "@/components/RatingForm";
import StatusFilter from "@/components/StatusFilter";
import { RIDE_STATUSES, RENTAL_STATUSES } from "@/lib/bookingStatus";

function buildOpenStreetMapUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lng.toFixed(6)}#map=16/${lat.toFixed(6)}/${lng.toFixed(6)}`;
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ rideStatus?: string; rentalStatus?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;
  const sp = await searchParams;
  const rideStatus = sp.rideStatus;
  const rentalStatus = sp.rentalStatus;

  const [dbUser, rides, rentals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { phone: true },
    }),
    prisma.rideBooking.findMany({
      where: {
        userId: user.id,
        ...(rideStatus ? { status: rideStatus } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        driver: { select: { name: true, phone: true } },
        rating: true,
      },
    }),
    prisma.rentalBooking.findMany({
      where: {
        userId: user.id,
        ...(rentalStatus ? { status: rentalStatus } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { rating: true },
    }),
  ]);

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Trang Ca Nhan & Lich Su</h1>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-bold mb-2">Thông tin tài khoản</h2>
          <p className="text-gray-400">Tên: {user.name || "Chưa cập nhật"}</p>
          <p className="text-gray-400">Email: {user.email || "Không có"}</p>
          <p className="text-gray-400">
            SĐT: {dbUser?.phone || "Chưa cập nhật"}
          </p>
        </div>

        <div className="mb-8">
          <EditProfileForm
            initialName={user.name || ""}
            initialPhone={dbUser?.phone || ""}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-blue-400">Cuốc Xe Đã Đặt</h2>
          <StatusFilter
            paramName="rideStatus"
            options={RIDE_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
        <div className="space-y-4 mb-8">
          {rides.length === 0 ? (
            <p className="text-gray-400">Ban chua dat cuoc xe nao.</p>
          ) : (
            rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-start gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold break-words">
                    Điểm đón: {ride.pickup}
                  </p>
                  <p className="text-sm text-gray-400">
                    {ride.distance} - {ride.time}
                  </p>
                  {ride.pickupLat !== null && ride.pickupLng !== null && (
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                      <p>
                        GPS: {ride.pickupLat.toFixed(5)}, {ride.pickupLng.toFixed(5)}
                      </p>
                      {ride.pickupAccuracy !== null && (
                        <p>Sai so: ~{Math.round(ride.pickupAccuracy)} m</p>
                      )}
                      <a
                        href={buildOpenStreetMapUrl(ride.pickupLat, ride.pickupLng)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-blue-300 hover:text-blue-200"
                      >
                        Xem tren ban do
                      </a>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-1 min-w-[180px]">
                  <p className="text-emerald-400 font-bold">
                    {ride.estimatedPrice.toLocaleString("vi-VN")} đ
                  </p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {ride.status}
                  </span>
                  {ride.driver && (
                    <p className="text-xs text-gray-400">
                      Tài xế: {ride.driver.name || "—"}
                      {ride.driver.phone && ` (${ride.driver.phone})`}
                    </p>
                  )}
                  {ride.status === "PENDING" && (
                    <CancelBookingButton type="ride" id={ride.id} />
                  )}
                  {ride.status === "COMPLETED" && !ride.rating && (
                    <RatingForm type="ride" id={ride.id} />
                  )}
                  {ride.rating && <RatingDisplay rating={ride.rating} />}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-orange-400">Lịch Sử Thuê Xe</h2>
          <StatusFilter
            paramName="rentalStatus"
            options={RENTAL_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
        <div className="space-y-4">
          {rentals.length === 0 ? (
            <p className="text-gray-400">Ban chua thue chiec xe nao.</p>
          ) : (
            rentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{rental.carName}</p>
                  <p className="text-sm text-gray-400">{rental.dateRange}</p>
                </div>
                <div className="text-right shrink-0 space-y-1 min-w-[180px]">
                  <p className="text-emerald-400 font-bold">
                    {rental.totalPrice.toLocaleString("vi-VN")} đ
                  </p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {rental.status}
                  </span>
                  {rental.status === "PENDING" && (
                    <CancelBookingButton type="rental" id={rental.id} />
                  )}
                  {rental.status === "COMPLETED" && !rental.rating && (
                    <RatingForm type="rental" id={rental.id} />
                  )}
                  {rental.rating && <RatingDisplay rating={rental.rating} />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RatingDisplay({
  rating,
}: {
  rating: { score: number; comment: string | null };
}) {
  return (
    <div className="text-xs text-gray-400 pt-1">
      <div className="flex items-center justify-end gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-3.5 h-3.5 ${
              rating.score >= n
                ? "fill-amber-400 text-amber-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
      {rating.comment && (
        <p className="italic mt-1 text-right max-w-[180px] line-clamp-2">
          &quot;{rating.comment}&quot;
        </p>
      )}
    </div>
  );
}
