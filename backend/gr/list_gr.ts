import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { GRHeader } from "./types";

interface ListGRRequest {
  warehouse_id?: Query<number>;
  status?: Query<string>;
}

interface ListGRResponse {
  grs: GRHeader[];
}

// Retrieves all goods receipts, optionally filtered by warehouse and status.
export const listGR = api<ListGRRequest, ListGRResponse>(
  { expose: true, method: "GET", path: "/api/gr" },
  async (req) => {
    let query = `SELECT * FROM gr_header WHERE 1=1`;
    const params: any[] = [];

    if (req.warehouse_id) {
      params.push(req.warehouse_id);
      query += ` AND warehouse_id = $${params.length}`;
    }
    if (req.status) {
      params.push(req.status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const rows = await db.rawQueryAll<GRHeader>(query, ...params);
    return { grs: rows };
  }
);
