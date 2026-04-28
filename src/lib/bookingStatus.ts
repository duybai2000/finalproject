export const RIDE_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const RENTAL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RideStatus = (typeof RIDE_STATUSES)[number];
export type RentalStatus = (typeof RENTAL_STATUSES)[number];
