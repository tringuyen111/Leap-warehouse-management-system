import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { ICVariance } from "./types";

interface GetVarianceResponse {
  variances: ICVariance[];
}

// Retrieves variance report for an inventory count.
export const getVariance = api<{ id: number }, GetVarianceResponse>(
  { expose: true, method: "GET", path: "/api/ic/:id/variance" },
  async ({ id }) => {
    const header = await db.queryRow<{ id: number }>`
      SELECT id FROM ic_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("inventory count not found");
    }

    const variances = await db.queryAll<ICVariance>`
      SELECT * FROM ic_variance 
      WHERE ic_header_id = ${id} 
      ORDER BY ABS(variance_qty) DESC
    `;

    return { variances };
  }
);
