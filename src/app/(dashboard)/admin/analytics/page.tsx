import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { getDashboardMetrics } from "@/services/analytics.service";

export default async function AnalyticsPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div>
        <h2 className="mb-3 font-semibold">Lead and booking trend</h2>
        <AnalyticsChart data={metrics.dailyLeads} />
      </div>
      <div>
        <h2 className="mb-3 font-semibold">Popular services</h2>
        <AnalyticsChart data={metrics.popularServices} type="bar" />
      </div>
    </div>
  );
}
