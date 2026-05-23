import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
