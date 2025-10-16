import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface OnhandRecord {
  id: number;
  warehouse_id: number;
  location_id: number;
  location_code: string;
  model_code: string;
  model_name: string;
  lot_number?: string;
  serial_number?: string;
  qty: number;
  base_uom_code: string;
  manufacture_date?: Date;
  expiry_date?: Date;
  last_updated: Date;
}

interface GetOnhandRequest {
  warehouse_id?: Query<number>;
  location_id?: Query<number>;
  model_code?: Query<string>;
}

interface GetOnhandResponse {
  records: OnhandRecord[];
}

// Retrieves current inventory on-hand, optionally filtered.
export const getOnhand = api<GetOnhandRequest, GetOnhandResponse>(
  { expose: true, method: "GET", path: "/api/inventory/onhand" },
  async (req) => {
    let query = `
      SELECT 
        io.id, io.warehouse_id, io.location_id, l.code as location_code,
        io.model_code, m.name as model_name, io.lot_number, io.serial_number,
        io.qty, io.base_uom_code, io.manufacture_date, io.expiry_date, io.last_updated
      FROM inventory_onhand io
      JOIN location l ON l.id = io.location_id
      JOIN model_goods m ON m.code = io.model_code
      WHERE io.qty > 0
    `;
    const params: any[] = [];

    if (req.warehouse_id) {
      params.push(req.warehouse_id);
      query += ` AND io.warehouse_id = $${params.length}`;
    }
    if (req.location_id) {
      params.push(req.location_id);
      query += ` AND io.location_id = $${params.length}`;
    }
    if (req.model_code) {
      params.push(req.model_code);
      query += ` AND io.model_code = $${params.length}`;
    }

    query += ` ORDER BY io.warehouse_id, l.code, io.model_code`;

    const rows = await db.rawQueryAll<OnhandRecord>(query, ...params);
    return { records: rows };
  }
);
