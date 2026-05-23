export const leadStatuses = ["New", "Pending", "Approved", "Rejected", "Reschedule Requested", "Confirmed", "Closed"] as const;

export const bookingStatuses = ["Pending Approval", "Approved", "Rejected", "Reschedule Requested", "Confirmed", "Closed"] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type BookingStatus = (typeof bookingStatuses)[number];
