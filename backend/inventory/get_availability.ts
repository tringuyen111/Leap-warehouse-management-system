import { api } from "encore.dev/api";
import db from "../db";

interface GetAvailabilityRequest {
  warehouse_id: number;
  model_code: string;
}

interface GetAvailabilityResponse {
  onhand_qty: number;
  reserved_qty: number;
  available_qty: number;
}

// Retrieves inventory availability for a specific model in a warehouse.
export const getAvailability = api<GetAvailabilityRequest, GetAvailabilityResponse>(
  { expose: true, method: "GET", path: "/api/inventory/availability" },
  async (req) => {
    const onhand = await db.queryRow<{ total: number }>`
      SELECT COALESCE(SUM(qty), 0) as total
      FROM inventory_onhand
      WHERE warehouse_id = ${req.warehouse_id} AND model_code = ${req.model_code}
    `;

    const reserved = await db.queryRow<{ total: number }>`
      SELECT COALESCE(SUM(reserved_qty), 0) as total
      FROM inventory_reservation
      WHERE warehouse_id = ${req.warehouse_id} AND model_code = ${req.model_code}
    `;

    const onhandQty = onhand?.total || 0;
    const reservedQty = reserved?.total || 0;

    return {
      onhand_qty: onhandQty,
      reserved_qty: reservedQty,
      available_qty: onhandQty - reservedQty,
    };
  }
);
