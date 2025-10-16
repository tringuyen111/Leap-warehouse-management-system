import { api, APIError } from "encore.dev/api";
import db from "../db";

interface PickingSuggestion {
  location_id: number;
  location_code: string;
  lot_number?: string;
  serial_number?: string;
  available_qty: number;
  expiry_date?: Date;
}

interface GetPickingSuggestionsResponse {
  suggestions: PickingSuggestion[];
}

// Generates picking suggestions using FEFO/FIFO logic.
export const getPickingSuggestions = api<{ gi_id: number; line_number: number }, GetPickingSuggestionsResponse>(
  { expose: true, method: "GET", path: "/api/gi/:gi_id/suggestions/:line_number" },
  async ({ gi_id, line_number }) => {
    const detail = await db.queryRow<{ model_code: string; planned_qty: number }>`
      SELECT model_code, planned_qty FROM gi_detail
      WHERE gi_header_id = ${gi_id} AND line_number = ${line_number}
    `;
    if (!detail) {
      throw APIError.notFound("goods issue detail not found");
    }

    const header = await db.queryRow<{ warehouse_id: number }>`
      SELECT warehouse_id FROM gi_header WHERE id = ${gi_id}
    `;

    const modelInfo = await db.queryRow<{ expiry_required: boolean }>`
      SELECT expiry_required FROM model_goods WHERE code = ${detail.model_code}
    `;

    let orderBy = "expiry_date ASC NULLS LAST";
    if (!modelInfo?.expiry_required) {
      orderBy = "io.id ASC";
    }

    const query = `
      SELECT 
        io.location_id,
        l.code as location_code,
        io.lot_number,
        io.serial_number,
        io.qty as available_qty,
        io.expiry_date
      FROM inventory_onhand io
      JOIN location l ON l.id = io.location_id
      WHERE io.warehouse_id = $1
        AND io.model_code = $2
        AND io.qty > 0
      ORDER BY ${orderBy}
    `;

    const rows = await db.rawQueryAll<PickingSuggestion>(query, header!.warehouse_id, detail.model_code);

    return { suggestions: rows };
  }
);
