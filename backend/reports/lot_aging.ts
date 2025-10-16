import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface LotAgingRecord {
  warehouse_id: number;
  location_id: number;
  location_code: string;
  model_code: string;
  model_name: string;
  lot_number?: string;
  manufacture_date?: Date;
  expiry_date?: Date;
  qty: number;
  base_uom_code: string;
  days_to_expiry?: number;
}

interface LotAgingRequest {
  warehouse_id?: Query<number>;
  model_code?: Query<string>;
}

interface LotAgingResponse {
  records: LotAgingRecord[];
}

// Retrieves lot aging report showing items approaching expiry.
export const getLotAging = api<LotAgingRequest, LotAgingResponse>(
  { expose: true, method: "GET", path: "/api/reports/lot-aging" },
  async (req) => {
    let query = `
      SELECT 
        io.warehouse_id,
        io.location_id,
        l.code as location_code,
        io.model_code,
        m.name as model_name,
        io.lot_number,
        io.manufacture_date,
        io.expiry_date,
        io.qty,
        io.base_uom_code,
        CASE 
          WHEN io.expiry_date IS NOT NULL THEN 
            EXTRACT(DAY FROM (io.expiry_date - CURRENT_DATE))
          ELSE NULL
        END as days_to_expiry
      FROM inventory_onhand io
      JOIN location l ON l.id = io.location_id
      JOIN model_goods m ON m.code = io.model_code
      WHERE io.qty > 0
        AND io.expiry_date IS NOT NULL
    `;
    const params: any[] = [];

    if (req.warehouse_id) {
      params.push(req.warehouse_id);
      query += ` AND io.warehouse_id = $${params.length}`;
    }
    if (req.model_code) {
      params.push(req.model_code);
      query += ` AND io.model_code = $${params.length}`;
    }

    query += ` ORDER BY days_to_expiry ASC, io.model_code`;

    const rows = await db.rawQueryAll<LotAgingRecord>(query, ...params);
    return { records: rows };
  }
);
