import prisma from "@/lib/prisma";

export type DailyRevenue = {
  date: string; // YYYY-MM-DD
  total: number;
};

export type RevenueStats = {
  total: number;
  thisWeek: number;
  paidBookings: number;
  daily: DailyRevenue[]; // last 7 days, oldest first
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
      select: { estimatedPrice: true, paidAt: true },
    }),
    prisma.rentalBooking.findMany({
      where: { paidAt: { not: null } },
      select: { totalPrice: true, paidAt: true },
    }),
  ]);

  let total = 0;
  let thisWeek = 0;
  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenAgo.getTime() + i * 24 * 60 * 60 * 1000);
    buckets.set(isoDay(d), 0);
  }

  const accumulate = (price: number, paidAt: Date | null) => {
    if (!paidAt) return;
    total += price;
    const dayKey = isoDay(startOfDayUtc(paidAt));
    if (buckets.has(dayKey)) {
      buckets.set(dayKey, (buckets.get(dayKey) ?? 0) + price);
      thisWeek += price;
    }
  };

  for (const r of paidRides) accumulate(r.estimatedPrice, r.paidAt);
  for (const r of paidRentals) accumulate(r.totalPrice, r.paidAt);

  const daily: DailyRevenue[] = Array.from(buckets.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  return {
    total,
    thisWeek,
    paidBookings: paidRides.length + paidRentals.length,
    daily,
  };
}
