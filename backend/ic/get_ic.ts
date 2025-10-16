import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { ICHeader, ICDetail } from "./types";

interface GetICResponse {
  header: ICHeader;
  details: ICDetail[];
}

// Retrieves an inventory count by ID.
export const getIC = api<{ id: number }, GetICResponse>(
  { expose: true, method: "GET", path: "/api/ic/:id" },
  async ({ id }) => {
    const header = await db.queryRow<ICHeader>`
      SELECT * FROM ic_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("inventory count not found");
    }

    const details = await db.queryAll<ICDetail>`
      SELECT * FROM ic_detail WHERE ic_header_id = ${id} ORDER BY location_id, model_code
    `;

    return { header, details };
  }
);
