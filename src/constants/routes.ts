import { BarChart3, BookOpenText, CalendarClock, LayoutDashboard, MessageSquareText, Settings, UsersRound } from "lucide-react";

export const dashboardRoutes = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: UsersRound },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/knowledge-base", label: "Knowledge", icon: BookOpenText },
  { href: "/admin/services", label: "Services", icon: MessageSquareText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];
