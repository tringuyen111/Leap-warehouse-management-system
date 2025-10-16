import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  MapPin,
  Package,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  MoveVertical,
  BarChart3,
  BoxIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Warehouses", href: "/warehouses", icon: Warehouse },
  { name: "Locations", href: "/locations", icon: MapPin },
  { name: "Goods Types", href: "/goods-types", icon: BoxIcon },
  { name: "Model Goods", href: "/model-goods", icon: Package },
  { name: "UoMs", href: "/uoms", icon: Package },
  { name: "Partners", href: "/partners", icon: Users },
  { name: "Goods Receipts", href: "/goods-receipts", icon: ArrowDownToLine },
  { name: "Goods Issues", href: "/goods-issues", icon: ArrowUpFromLine },
  { name: "Inventory Counts", href: "/inventory-counts", icon: ClipboardList },
  { name: "Putaway", href: "/putaway", icon: MoveVertical },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-r border-border">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground">Delfi Inventory Pro</h1>
            <p className="text-sm text-muted-foreground mt-1">Warehouse Management System</p>
          </div>
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
