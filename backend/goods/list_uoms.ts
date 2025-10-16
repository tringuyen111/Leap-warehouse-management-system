import { api } from "encore.dev/api";
import db from "../db";
import type { UoM } from "./types";

interface ListUoMsResponse {
  uoms: UoM[];
}

// Retrieves all units of measure.
export const listUoMs = api<void, ListUoMsResponse>(
  { expose: true, method: "GET", path: "/api/uoms" },
  async () => {
    const rows = await db.queryAll<UoM>`
      SELECT * FROM uom ORDER BY code
    `;
    return { uoms: rows };
  }
);
