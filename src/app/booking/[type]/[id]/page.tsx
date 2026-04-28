import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ type: string; id: string }>;

function PaidBadge({ paidAt }: { paidAt: Date | null }) {
  if (paidAt) {
    return (
      <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded">
        Da thanh toan {paidAt.toLocaleDateString("vi-VN")}
      </span>
    );
  }
  return (
    <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
      Chua thanh toan
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
    const ride = await prisma.rideBooking.findUnique({ where: { id } });
    if (!ride || ride.userId !== userId) notFound();

    return (
      <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 mb-6">
            <h1 className="text-2xl font-bold text-emerald-200">
              {ride.paidAt
                ? "Da thanh toan thanh cong"
                : "Da dat tai xe thanh cong"}
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1">Ma don: {ride.id}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <h2 className="text-lg font-semibold">Chi tiet cuoc xe</h2>
              <PaidBadge paidAt={ride.paidAt} />
            </div>
            <p>
              <span className="text-gray-400">Điểm đón: </span>
              {ride.pickup}
            </p>
            <p>
              <span className="text-gray-400">Lịch thuê: </span>
              {ride.distance}
            </p>
            <p>
              <span className="text-gray-400">Thời gian: </span>
              {ride.time}
            </p>
            <p>
              <span className="text-gray-400">Tong gia: </span>
              <span className="text-emerald-400 font-bold">
                {ride.estimatedPrice.toLocaleString("vi-VN")} d
              </span>
            </p>
            <p>
              <span className="text-gray-400">Trang thai: </span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {ride.status}
              </span>
            </p>
            <p className="text-sm text-gray-400 pt-2">
              {ride.paidAt
                ? "Cam on ban da hoan tat thanh toan."
                : "He thong dang tim tai xe phu hop. Quan tri vien se xac nhan don cua ban."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {!ride.paidAt && (
              <Link
                href={`/booking/ride/${ride.id}/payment`}
                className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Thanh toan ngay
              </Link>
            )}
            <Link
              href="/profile"
              className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Xem lich su
            </Link>
            <Link
              href="/"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Ve trang chu
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
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 mb-6">
          <h1 className="text-2xl font-bold text-emerald-200">
            {rental.paidAt
              ? "Da thanh toan thanh cong"
              : "Da thue xe thanh cong"}
          </h1>
          <p className="text-sm text-emerald-100/80 mt-1">Ma don: {rental.id}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-start gap-3">
            <h2 className="text-lg font-semibold">Chi tiet thue xe</h2>
            <PaidBadge paidAt={rental.paidAt} />
          </div>
          <p>
            <span className="text-gray-400">Xe: </span>
            {rental.carName}
          </p>
          <p>
            <span className="text-gray-400">Lich thue: </span>
            {rental.dateRange}
          </p>
          <p>
            <span className="text-gray-400">Tong gia: </span>
            <span className="text-emerald-400 font-bold">
              {rental.totalPrice.toLocaleString("vi-VN")} d
            </span>
          </p>
          <p>
            <span className="text-gray-400">Trang thai: </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {rental.status}
            </span>
          </p>
          <p className="text-sm text-gray-400 pt-2">
            {rental.paidAt
              ? "Cam on ban da hoan tat thanh toan."
              : "Quan tri vien se xac nhan don thue xe cua ban som nhat."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {!rental.paidAt && (
            <Link
              href={`/booking/rental/${rental.id}/payment`}
              className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Thanh toan ngay
            </Link>
          )}
          <Link
            href="/profile"
            className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Xem lich su
          </Link>
          <Link
            href="/"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Ve trang chu
          </Link>
        </div>
      </div>
    </div>
  );
}
