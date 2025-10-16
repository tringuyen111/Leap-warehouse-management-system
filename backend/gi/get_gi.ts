import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { GIHeader, GIDetail } from "./types";

interface GetGIResponse {
  header: GIHeader;
  details: GIDetail[];
}

// Retrieves a goods issue by ID.
export const getGI = api<{ id: number }, GetGIResponse>(
  { expose: true, method: "GET", path: "/api/gi/:id" },
  async ({ id }) => {
    const header = await db.queryRow<GIHeader>`
      SELECT * FROM gi_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("goods issue not found");
    }

    const details = await db.queryAll<GIDetail>`
      SELECT * FROM gi_detail WHERE gi_header_id = ${id} ORDER BY line_number
    `;

    return { header, details };
  }
);
