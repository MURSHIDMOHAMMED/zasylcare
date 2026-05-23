import { BookingTable } from "@/components/dashboard/BookingTable";
import { listBookings } from "@/services/booking.service";

export default async function BookingsPage() {
  const bookings = await listBookings();
  return <BookingTable bookings={bookings} />;
}
