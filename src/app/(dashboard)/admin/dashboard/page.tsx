import { Bot, CalendarClock, CheckCircle2, UsersRound } from "lucide-react";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { LeadTable } from "@/components/dashboard/LeadTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { getDashboardMetrics } from "@/services/analytics.service";
import { listBookings } from "@/services/booking.service";
import { listLeads } from "@/services/lead.service";

export default async function DashboardPage() {
  const [metrics, leads, bookings] = await Promise.all([getDashboardMetrics(), listLeads(), listBookings()]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total leads" value={metrics.totalLeads} helper="Captured from chatbot and CRM forms" icon={UsersRound} />
        <StatsCard title="Active chats" value={metrics.activeChats} helper="Visitors currently in conversation" icon={Bot} />
        <StatsCard title="Bookings" value={metrics.bookings} helper="Consultation requests created" icon={CalendarClock} />
        <StatsCard title="Conversion rate" value={`${metrics.conversionRate}%`} helper="Approved bookings from leads" icon={CheckCircle2} />
      </div>
      <AnalyticsChart data={metrics.dailyLeads} />
      <div className="grid gap-6 xl:grid-cols-2">
        <LeadTable leads={leads} />
        <BookingTable bookings={bookings} />
      </div>
    </div>
  );
}
