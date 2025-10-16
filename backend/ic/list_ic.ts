import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { ICHeader } from "./types";

interface ListICRequest {
  warehouse_id?: Query<number>;
  status?: Query<string>;
}

interface ListICResponse {
  ics: ICHeader[];
}

// Retrieves all inventory counts, optionally filtered by warehouse and status.
export const listIC = api<ListICRequest, ListICResponse>(
  { expose: true, method: "GET", path: "/api/ic" },
  async (req) => {
    let query = `SELECT * FROM ic_header WHERE 1=1`;
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

    const rows = await db.rawQueryAll<ICHeader>(query, ...params);
    return { ics: rows };
  }
);
