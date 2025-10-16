import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateUoMRequest {
  code: string;
  name: string;
}

// Creates a new unit of measure.
export const createUoM = api<CreateUoMRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/uoms" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM uom WHERE code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("UoM with this code already exists");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO uom (code, name)
      VALUES (${req.code}, ${req.name})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
