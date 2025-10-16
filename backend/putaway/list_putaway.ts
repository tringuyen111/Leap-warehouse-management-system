import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { PutawayBatch } from "./types";

interface ListPutawayRequest {
  warehouse_id?: Query<number>;
  status?: Query<string>;
}

interface ListPutawayResponse {
  batches: PutawayBatch[];
}

// Retrieves all putaway batches, optionally filtered by warehouse and status.
export const listPutaway = api<ListPutawayRequest, ListPutawayResponse>(
  { expose: true, method: "GET", path: "/api/putaway" },
  async (req) => {
    let query = `SELECT * FROM putaway_batch WHERE 1=1`;
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

    const rows = await db.rawQueryAll<PutawayBatch>(query, ...params);
    return { batches: rows };
  }
);
