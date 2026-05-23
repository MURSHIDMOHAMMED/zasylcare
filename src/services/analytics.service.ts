import { demoBookings } from "@/services/booking.service";
import { demoLeads } from "@/services/lead.service";

export async function getDashboardMetrics() {
  const totalLeads = demoLeads.length;
  const bookings = demoBookings.length;
  const pendingApprovals = demoBookings.filter((booking) => booking.status === "Pending Approval").length;
  const approved = demoBookings.filter((booking) => booking.status === "Approved").length;

  return {
    totalLeads,
    activeChats: 18,
    bookings,
    pendingApprovals,
    conversionRate: totalLeads ? Math.round((approved / totalLeads) * 100) : 0,
    dailyLeads: [
      { label: "Mon", leads: 8, bookings: 2 },
      { label: "Tue", leads: 12, bookings: 4 },
      { label: "Wed", leads: 10, bookings: 3 },
      { label: "Thu", leads: 16, bookings: 6 },
      { label: "Fri", leads: 22, bookings: 8 }
    ],
    popularServices: [
      { name: "Growth package", value: 42 },
      { name: "Enterprise", value: 27 },
      { name: "Starter", value: 19 }
    ]
  };
}
