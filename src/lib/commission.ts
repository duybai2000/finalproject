export const PLATFORM_COMMISSION_RATE = 0.15;
export const DRIVER_COMMISSION_RATE = 0.1;

export type CommissionSplit = {
  gross: number;
  ownerNet: number;
  platformCommission: number;
};

/**
 * Split a paid booking total between the car owner and the platform.
 * For platform-owned cars (no owner), the platform keeps the whole amount.
 */
export function splitRevenue(
  totalPrice: number,
  hasOwner: boolean
): CommissionSplit {
  if (!hasOwner) {
    return {
      gross: totalPrice,
      ownerNet: 0,
      platformCommission: totalPrice,
    };
  }

  const platformCommission = Math.round(totalPrice * PLATFORM_COMMISSION_RATE);
  const ownerNet = totalPrice - platformCommission;
  return { gross: totalPrice, ownerNet, platformCommission };
}

export type DriverSplit = {
  gross: number;
  driverNet: number;
  platformCommission: number;
};

/**
 * Split a paid ride between the driver and the platform (10% commission).
 * If no driver was assigned (legacy / unclaimed), the platform keeps it all.
 */
export function splitRideRevenue(
  totalPrice: number,
  hasDriver: boolean
): DriverSplit {
  if (!hasDriver) {
    return {
      gross: totalPrice,
      driverNet: 0,
      platformCommission: totalPrice,
    };
  }
  const platformCommission = Math.round(totalPrice * DRIVER_COMMISSION_RATE);
  const driverNet = totalPrice - platformCommission;
  return { gross: totalPrice, driverNet, platformCommission };
}
