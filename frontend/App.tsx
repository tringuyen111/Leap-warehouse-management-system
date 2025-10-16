import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import Warehouses from "./pages/Warehouses";
import Locations from "./pages/Locations";
import GoodsTypes from "./pages/GoodsTypes";
import ModelGoods from "./pages/ModelGoods";
import UoMs from "./pages/UoMs";
import Partners from "./pages/Partners";
import GoodsReceipts from "./pages/GoodsReceipts";
import GoodsIssues from "./pages/GoodsIssues";
import InventoryCounts from "./pages/InventoryCounts";
import PutawayBatches from "./pages/PutawayBatches";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="locations" element={<Locations />} />
              <Route path="goods-types" element={<GoodsTypes />} />
              <Route path="model-goods" element={<ModelGoods />} />
              <Route path="uoms" element={<UoMs />} />
              <Route path="partners" element={<Partners />} />
              <Route path="goods-receipts" element={<GoodsReceipts />} />
              <Route path="goods-issues" element={<GoodsIssues />} />
              <Route path="inventory-counts" element={<InventoryCounts />} />
              <Route path="putaway" element={<PutawayBatches />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}
