import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  MoveVertical,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const response = await backend.reports.getDashboardMetrics({});
      return response;
    },
  });

  const stats = [
    {
      title: "Total Items On-hand",
      value: metrics?.total_onhand_value || 0,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Transactions Today",
      value: metrics?.total_transactions_today || 0,
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Pending GR",
      value: metrics?.pending_gr_count || 0,
      icon: ArrowDownToLine,
      color: "text-purple-500",
    },
    {
      title: "Pending GI",
      value: metrics?.pending_gi_count || 0,
      icon: ArrowUpFromLine,
      color: "text-orange-500",
    },
    {
      title: "Pending IC",
      value: metrics?.pending_ic_count || 0,
      icon: ClipboardList,
      color: "text-yellow-500",
    },
    {
      title: "Pending Putaway",
      value: metrics?.pending_putaway_count || 0,
      icon: MoveVertical,
      color: "text-cyan-500",
    },
    {
      title: "Low Stock Items",
      value: metrics?.low_stock_items || 0,
      icon: TrendingUp,
      color: "text-red-500",
    },
    {
      title: "Expiring Soon",
      value: metrics?.expiring_soon_items || 0,
      icon: AlertTriangle,
      color: "text-amber-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Warehouse overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View transaction logs in the Reports section for detailed activity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use the sidebar navigation to access all modules and operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
