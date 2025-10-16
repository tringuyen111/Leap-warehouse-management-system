import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { GRHeader, GRDetail } from "./types";

interface GetGRResponse {
  header: GRHeader;
  details: GRDetail[];
}

// Retrieves a goods receipt by ID.
export const getGR = api<{ id: number }, GetGRResponse>(
  { expose: true, method: "GET", path: "/api/gr/:id" },
  async ({ id }) => {
    const header = await db.queryRow<GRHeader>`
      SELECT * FROM gr_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("goods receipt not found");
    }

    const details = await db.queryAll<GRDetail>`
      SELECT * FROM gr_detail WHERE gr_header_id = ${id} ORDER BY line_number
    `;

    return { header, details };
  }
);
