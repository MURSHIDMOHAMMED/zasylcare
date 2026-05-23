"use client";

import { useEffect, useState } from "react";
import type { Booking } from "@/types/booking.types";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((response) => response.json())
      .then((data) => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { bookings, loading };
}
