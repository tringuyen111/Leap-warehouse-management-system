import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface DashboardMetrics {
  total_onhand_value: number;
  total_transactions_today: number;
  pending_gr_count: number;
  pending_gi_count: number;
  pending_ic_count: number;
  pending_putaway_count: number;
  low_stock_items: number;
  expiring_soon_items: number;
}

interface DashboardRequest {
  warehouse_id?: Query<number>;
}

// Retrieves dashboard metrics for warehouse overview.
export const getDashboardMetrics = api<DashboardRequest, DashboardMetrics>(
  { expose: true, method: "GET", path: "/api/reports/dashboard" },
  async (req) => {
    let warehouseFilter = '';
    const params: any[] = [];

    if (req.warehouse_id) {
      params.push(req.warehouse_id);
      warehouseFilter = ` WHERE warehouse_id = $${params.length}`;
    }

    const onhandValue = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM inventory_onhand${warehouseFilter} AND qty > 0`,
      ...params
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const transactionsToday = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM transaction_log 
       WHERE transaction_date >= $1${req.warehouse_id ? ' AND warehouse_id = $2' : ''}`,
      todayStart,
      ...(req.warehouse_id ? [req.warehouse_id] : [])
    );

    const pendingGR = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM gr_header 
       WHERE status IN ('draft', 'receiving')${req.warehouse_id ? ' AND warehouse_id = $1' : ''}`,
      ...(req.warehouse_id ? [req.warehouse_id] : [])
    );

    const pendingGI = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM gi_header 
       WHERE status IN ('draft', 'created', 'picking')${req.warehouse_id ? ' AND warehouse_id = $1' : ''}`,
      ...(req.warehouse_id ? [req.warehouse_id] : [])
    );

    const pendingIC = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM ic_header 
       WHERE status IN ('draft', 'created', 'counting')${req.warehouse_id ? ' AND warehouse_id = $1' : ''}`,
      ...(req.warehouse_id ? [req.warehouse_id] : [])
    );

    const pendingPutaway = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM putaway_batch 
       WHERE status = 'new'${req.warehouse_id ? ' AND warehouse_id = $1' : ''}`,
      ...(req.warehouse_id ? [req.warehouse_id] : [])
    );

    const expiringSoon = await db.rawQueryRow<{ total: number }>(
      `SELECT COALESCE(COUNT(*), 0) as total FROM inventory_onhand 
       WHERE expiry_date IS NOT NULL 
         AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
         AND qty > 0${req.warehouse_id ? ' AND warehouse_id = $1' : ''}`,
      ...(req.warehouse_id ? [req.warehouse_id] : [])
    );

    return {
      total_onhand_value: onhandValue?.total || 0,
      total_transactions_today: transactionsToday?.total || 0,
      pending_gr_count: pendingGR?.total || 0,
      pending_gi_count: pendingGI?.total || 0,
      pending_ic_count: pendingIC?.total || 0,
      pending_putaway_count: pendingPutaway?.total || 0,
      low_stock_items: 0,
      expiring_soon_items: expiringSoon?.total || 0,
    };
  }
);
