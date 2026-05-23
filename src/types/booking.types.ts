import type { BookingStatus } from "@/constants/statuses";

export type Booking = {
  id: string;
  companyId: string;
  leadId: string;
  requestedDate: string;
  requestedTime: string;
  approvedDate?: string | null;
  approvedTime?: string | null;
  status: BookingStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};
