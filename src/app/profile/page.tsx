import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

function buildOpenStreetMapUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lng.toFixed(6)}#map=16/${lat.toFixed(6)}/${lng.toFixed(6)}`;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as SessionUser;

  const rides = await prisma.rideBooking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const rentals = await prisma.rentalBooking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Trang Ca Nhan & Lich Su</h1>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold mb-2">Thong tin tai khoan</h2>
          <p className="text-gray-400">Ten: {user.name || "Chua cap nhat"}</p>
          <p className="text-gray-400">Email: {user.email || "Khong co"}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-blue-400">Cuoc Xe Da Dat</h2>
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
                    {ride.pickup} -&gt; {ride.dropoff}
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
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-bold">
                    {ride.estimatedPrice.toLocaleString("vi-VN")} d
                  </p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {ride.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4 text-orange-400">Lich Su Thue Xe</h2>
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
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-bold">
                    {rental.totalPrice.toLocaleString("vi-VN")} d
                  </p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {rental.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
