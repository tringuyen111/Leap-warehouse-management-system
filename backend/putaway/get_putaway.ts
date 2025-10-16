import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { PutawayBatch, PutawayDetail } from "./types";

interface GetPutawayResponse {
  batch: PutawayBatch;
  details: PutawayDetail[];
}

// Retrieves a putaway batch by ID.
export const getPutaway = api<{ id: number }, GetPutawayResponse>(
  { expose: true, method: "GET", path: "/api/putaway/:id" },
  async ({ id }) => {
    const batch = await db.queryRow<PutawayBatch>`
      SELECT * FROM putaway_batch WHERE id = ${id}
    `;
    if (!batch) {
      throw APIError.notFound("putaway batch not found");
    }

    const details = await db.queryAll<PutawayDetail>`
      SELECT * FROM putaway_detail WHERE putaway_batch_id = ${id} ORDER BY line_number
    `;

    return { batch, details };
  }
);
