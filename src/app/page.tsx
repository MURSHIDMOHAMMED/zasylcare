import Link from "next/link";
import { ArrowRight, Bot, CalendarCheck, DatabaseZap, ShieldCheck } from "lucide-react";

const features = [
  { icon: Bot, title: "Grounded AI Receptionist", text: "Answers only from approved company knowledge and routes unknowns into lead capture." },
  { icon: CalendarCheck, title: "Approval-First Bookings", text: "Every consultation request starts pending until the admin approves, rejects, or reschedules." },
  { icon: DatabaseZap, title: "Built-In CRM", text: "Track leads, chat history, scores, statuses, source, and booking context in one dashboard." },
  { icon: ShieldCheck, title: "SaaS Ready", text: "Company-scoped data model, protected APIs, Supabase Auth, RLS policies, and modular services." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">ReceptionAI CRM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground" href="/login">
              Login
            </Link>
            <Link className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/admin/dashboard">
              Admin Demo
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">AI lead generation platform</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-foreground md:text-7xl">
              ReceptionAI CRM
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              A production-ready customer support chatbot SaaS for companies that need knowledge-based answers, natural lead capture,
              consultation bookings, and admin-controlled approvals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground" href="/chatbot/zasyl-care">
                Try chatbot <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-3 text-sm font-semibold" href="/admin/leads">
                View CRM
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3 shadow-soft">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Live business inbox</p>
                  <p className="text-xs text-muted-foreground">Grounded answer to interest detection to lead request</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Online</span>
              </div>
              <div className="space-y-3">
                {["Hi, I need help managing an ongoing health condition.", "zasyl.care provides healthcare support, consultation services, and continuous care management for patients with ongoing health needs.", "Can I request a consultation?", "Yes. Please share your concern, preferred date and time, and contact details so the care team can follow up with next steps."].map((message, index) => (
                  <div key={message} className={`max-w-[84%] rounded-lg px-4 py-3 text-sm ${index % 2 ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                    {message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pb-8 md:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-5">
              <feature.icon className="mb-4 h-5 w-5 text-primary" />
              <h2 className="font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
