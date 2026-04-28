import prisma from "@/lib/prisma";
import { splitRevenue, splitRideRevenue } from "@/lib/commission";

export type DailyRevenue = {
  date: string; // YYYY-MM-DD
  total: number;
};

export type RevenueStats = {
  total: number;
  thisWeek: number;
  paidBookings: number;
  daily: DailyRevenue[]; // last 7 days, oldest first
  platformDirect: number; // gross from platform-owned (unclaimed rides + own-fleet rentals)
  commission: number; // 15% rental + 10% ride commission
  ownerPayouts: number; // 85% to owners
  driverPayouts: number; // 90% to drivers
};

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isoDay(d: Date) {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${d.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getRevenueStats(): Promise<RevenueStats> {
  const today = startOfDayUtc(new Date());
  const sevenAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [paidRides, paidRentals] = await Promise.all([
    prisma.rideBooking.findMany({
      where: { paidAt: { not: null } },
      select: { estimatedPrice: true, paidAt: true, driverId: true },
    }),
    prisma.rentalBooking.findMany({
      where: { paidAt: { not: null } },
      select: { totalPrice: true, paidAt: true, carId: true },
    }),
  ]);

  // Resolve ownership for each rental's car
  const carIds = Array.from(new Set(paidRentals.map((r) => r.carId)));
  const cars =
    carIds.length === 0
      ? []
      : await prisma.car.findMany({
          where: { id: { in: carIds } },
          select: { id: true, ownerId: true },
        });
  const ownerById = new Map(cars.map((c) => [c.id, c.ownerId]));

  let platformDirect = 0;
  let commission = 0;
  let ownerPayouts = 0;
  let driverPayouts = 0;
  let total = 0;
  let thisWeek = 0;

  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenAgo.getTime() + i * 24 * 60 * 60 * 1000);
    buckets.set(isoDay(d), 0);
  }

  // Ride revenue: 10% to platform if a driver claimed it; otherwise 100% platform.
  for (const r of paidRides) {
    if (!r.paidAt) continue;
    const split = splitRideRevenue(r.estimatedPrice, !!r.driverId);
    if (r.driverId) {
      commission += split.platformCommission;
      driverPayouts += split.driverNet;
    } else {
      platformDirect += split.platformCommission; // == estimatedPrice
    }
    total += r.estimatedPrice;
    const dayKey = isoDay(startOfDayUtc(r.paidAt));
    if (buckets.has(dayKey)) {
      buckets.set(dayKey, (buckets.get(dayKey) ?? 0) + r.estimatedPrice);
      thisWeek += r.estimatedPrice;
    }
  }

  for (const r of paidRentals) {
    if (!r.paidAt) continue;
    const ownerId = ownerById.get(r.carId) ?? null;
    const split = splitRevenue(r.totalPrice, !!ownerId);

    if (ownerId) {
      commission += split.platformCommission;
      ownerPayouts += split.ownerNet;
    } else {
      platformDirect += split.platformCommission; // == totalPrice
    }
    total += r.totalPrice;

    const dayKey = isoDay(startOfDayUtc(r.paidAt));
    if (buckets.has(dayKey)) {
      buckets.set(dayKey, (buckets.get(dayKey) ?? 0) + r.totalPrice);
      thisWeek += r.totalPrice;
    }
  }

  const daily: DailyRevenue[] = Array.from(buckets.entries()).map(
    ([date, total]) => ({ date, total })
  );

  return {
    total,
    thisWeek,
    paidBookings: paidRides.length + paidRentals.length,
    daily,
    platformDirect,
    commission,
    ownerPayouts,
    driverPayouts,
  };
}

export async function getDriverEarnings(driverId: string) {
  const paid = await prisma.rideBooking.findMany({
    where: { driverId, paidAt: { not: null } },
    select: { estimatedPrice: true },
  });

  let gross = 0;
  let net = 0;
  let commission = 0;
  for (const r of paid) {
    const split = splitRideRevenue(r.estimatedPrice, true);
    gross += split.gross;
    net += split.driverNet;
    commission += split.platformCommission;
  }
  return { gross, net, commission, paidRides: paid.length };
}

/**
 * Earnings for a specific owner: sum of paid rentals on their cars,
 * net of the platform commission.
 */
export async function getOwnerEarnings(ownerId: string) {
  const cars = await prisma.car.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const carIds = cars.map((c) => c.id);

  if (carIds.length === 0) {
    return { gross: 0, net: 0, commission: 0, paidBookings: 0 };
  }

  const paid = await prisma.rentalBooking.findMany({
    where: { carId: { in: carIds }, paidAt: { not: null } },
    select: { totalPrice: true },
  });

  let gross = 0;
  let net = 0;
  let commission = 0;
  for (const b of paid) {
    const split = splitRevenue(b.totalPrice, true);
    gross += split.gross;
    net += split.ownerNet;
    commission += split.platformCommission;
  }
  return { gross, net, commission, paidBookings: paid.length };
}
