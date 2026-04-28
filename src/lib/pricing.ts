const DRIVER_DAILY_RATE = 1_000_000;
const WEEKEND_OR_HOLIDAY_MULTIPLIER = 1.2;
const PER_KM_RATE = 8_000;
const ROAD_FACTOR = 1.3; // straight-line -> approximate road distance multiplier

const FIXED_HOLIDAYS = new Set(["01-01", "04-30", "05-01", "09-02"]);

type PricingDay = {
  date: Date;
  isWeekendOrHoliday: boolean;
  rate: number;
};

export type PricingBreakdown = {
  total: number;
  baseTotal: number;
  surchargeTotal: number;
  totalDays: number;
  surchargeDays: number;
  normalDays: number;
};

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function formatMonthDay(date: Date) {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${month}-${day}`;
}

function isWeekendOrHoliday(date: Date) {
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6 || FIXED_HOLIDAYS.has(formatMonthDay(date));
}

function enumerateDays(startDate: string, endDate: string) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);

  if (!start || !end || start > end) {
    return null;
  }

  const days: PricingDay[] = [];

  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  ) {
    const flagged = isWeekendOrHoliday(cursor);
    days.push({
      date: new Date(cursor),
      isWeekendOrHoliday: flagged,
      rate: flagged
        ? Math.round(DRIVER_DAILY_RATE * WEEKEND_OR_HOLIDAY_MULTIPLIER)
        : DRIVER_DAILY_RATE,
    });
  }

  return days;
}

function buildBreakdown(days: PricingDay[], dailyRate: number): PricingBreakdown {
  let total = 0;
  let baseTotal = 0;
  let surchargeTotal = 0;
  let surchargeDays = 0;

  for (const day of days) {
    const dayRate = day.isWeekendOrHoliday
      ? Math.round(dailyRate * WEEKEND_OR_HOLIDAY_MULTIPLIER)
      : dailyRate;

    total += dayRate;
    baseTotal += dailyRate;

    if (day.isWeekendOrHoliday) {
      surchargeDays += 1;
      surchargeTotal += dayRate - dailyRate;
    }
  }

  return {
    total,
    baseTotal,
    surchargeTotal,
    totalDays: days.length,
    surchargeDays,
    normalDays: days.length - surchargeDays,
  };
}

export function getDriverDailyRate() {
  return DRIVER_DAILY_RATE;
}

export function getPerKmRate() {
  return PER_KM_RATE;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateRoadDistanceKm(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
) {
  const straight = haversineKm(pickupLat, pickupLng, dropoffLat, dropoffLng);
  return straight * ROAD_FACTOR;
}

export type DriverHireBreakdown = {
  total: number;
  daysFare: number;
  baseTotal: number;
  surchargeTotal: number;
  distanceFee: number;
  distanceKm: number;
  totalDays: number;
  surchargeDays: number;
  normalDays: number;
};

export function calculateDriverHirePrice(
  startDate: string,
  endDate: string,
  pickupLat?: number | null,
  pickupLng?: number | null,
  dropoffLat?: number | null,
  dropoffLng?: number | null
): DriverHireBreakdown | null {
  const days = enumerateDays(startDate, endDate);
  if (!days) return null;

  const daysBreakdown = buildBreakdown(days, DRIVER_DAILY_RATE);

  let distanceKm = 0;
  let distanceFee = 0;

  if (
    typeof pickupLat === "number" &&
    typeof pickupLng === "number" &&
    typeof dropoffLat === "number" &&
    typeof dropoffLng === "number"
  ) {
    distanceKm = estimateRoadDistanceKm(pickupLat, pickupLng, dropoffLat, dropoffLng);
    distanceFee = Math.round(distanceKm * PER_KM_RATE);
  }

  return {
    total: daysBreakdown.total + distanceFee,
    daysFare: daysBreakdown.total,
    baseTotal: daysBreakdown.baseTotal,
    surchargeTotal: daysBreakdown.surchargeTotal,
    distanceFee,
    distanceKm,
    totalDays: daysBreakdown.totalDays,
    surchargeDays: daysBreakdown.surchargeDays,
    normalDays: daysBreakdown.normalDays,
  };
}

export function calculateCarRentalPrice(
  dailyRate: number,
  startDate?: string,
  endDate?: string
) {
  if (!startDate || !endDate) {
    return {
      total: dailyRate,
      baseTotal: dailyRate,
      surchargeTotal: 0,
      totalDays: 1,
      surchargeDays: 0,
      normalDays: 1,
    };
  }

  const days = enumerateDays(startDate, endDate);

  if (!days) {
    return null;
  }

  return buildBreakdown(days, dailyRate);
}
