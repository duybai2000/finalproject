export const PLATFORM_COMMISSION_RATE = 0.15;

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
