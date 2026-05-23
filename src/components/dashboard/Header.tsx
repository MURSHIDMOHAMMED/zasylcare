"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Moon, Search, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/leads": "Leads",
  "/admin/bookings": "Bookings",
  "/admin/knowledge-base": "Knowledge Base",
  "/admin/services": "Services",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings"
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New lead from chatbot: Sarah Malik", time: "2 min ago", read: false },
    { id: 2, text: "Booking approved for Omar Khan", time: "1 hour ago", read: true },
    { id: 3, text: "New knowledge entry added", time: "3 hours ago", read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const title = pageTitles[pathname] ?? "Admin Panel";
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initialize dark mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Navigate to leads page with search context
    router.push(`/admin/leads`);
    toast(`Searching for "${searchQuery}"...`, "info");
    setSearchQuery("");
    setSearchOpen(false);
  }

  function handleLogout() {
    if (!confirm("Are you sure you want to log out?")) return;
    // In production this would call the auth service
    toast("Logged out successfully.", "info");
    router.push("/");
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read.");
  }

  function dismissNotification(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">zasyl.care</p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden w-full max-w-sm md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search leads, bookings, chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Mobile search toggle */}
          <Button variant="secondary" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          {/* Dark mode toggle */}
          <Button variant="secondary" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b p-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button className="text-xs text-primary hover:underline" onClick={markAllRead}>
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y">
                  {notifications.length === 0 && (
                    <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                  )}
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-2 p-3 ${!n.read ? "bg-primary/5" : ""}`}>
                      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                      <div className="flex-1">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                      </div>
                      <button
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => dismissNotification(n.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <Button variant="ghost" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search leads, bookings, chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </form>
      )}
    </header>
  );
}
