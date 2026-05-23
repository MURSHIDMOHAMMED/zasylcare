import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReceptionAI CRM",
  description: "AI customer support chatbot SaaS with admin CRM and booking approvals."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
