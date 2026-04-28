const DRIVER_DAILY_RATE = 1_000_000;
const WEEKEND_OR_HOLIDAY_MULTIPLIER = 1.2;

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

export function calculateDriverHirePrice(startDate: string, endDate: string) {
  const days = enumerateDays(startDate, endDate);
  if (!days) return null;
  return buildBreakdown(days, DRIVER_DAILY_RATE);
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
