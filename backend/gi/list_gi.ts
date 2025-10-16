import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { GIHeader } from "./types";

interface ListGIRequest {
  warehouse_id?: Query<number>;
  status?: Query<string>;
}

interface ListGIResponse {
  gis: GIHeader[];
}

// Retrieves all goods issues, optionally filtered by warehouse and status.
export const listGI = api<ListGIRequest, ListGIResponse>(
  { expose: true, method: "GET", path: "/api/gi" },
  async (req) => {
    let query = `SELECT * FROM gi_header WHERE 1=1`;
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

    const rows = await db.rawQueryAll<GIHeader>(query, ...params);
    return { gis: rows };
  }
);
