import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateUoMConversionRequest {
  model_code: string;
  from_uom: string;
  to_uom: string;
  factor: number;
  rounding_mode: string;
}

// Creates a new UoM conversion.
export const createUoMConversion = api<CreateUoMConversionRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/uom-conversions" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM uom_conversion 
      WHERE model_code = ${req.model_code} 
        AND from_uom = ${req.from_uom} 
        AND to_uom = ${req.to_uom}
    `;
    if (existing) {
      throw APIError.alreadyExists("UoM conversion already exists");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO uom_conversion (model_code, from_uom, to_uom, factor, rounding_mode)
      VALUES (${req.model_code}, ${req.from_uom}, ${req.to_uom}, ${req.factor}, ${req.rounding_mode})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
