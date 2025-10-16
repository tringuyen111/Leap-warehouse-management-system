import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { UoMConversion } from "./types";

interface ListUoMConversionsRequest {
  model_code?: Query<string>;
}

interface ListUoMConversionsResponse {
  conversions: UoMConversion[];
}

// Retrieves all UoM conversions, optionally filtered by model.
export const listUoMConversions = api<ListUoMConversionsRequest, ListUoMConversionsResponse>(
  { expose: true, method: "GET", path: "/api/uom-conversions" },
  async (req) => {
    let rows: UoMConversion[];
    if (req.model_code) {
      rows = await db.queryAll<UoMConversion>`
        SELECT * FROM uom_conversion 
        WHERE model_code = ${req.model_code}
        ORDER BY from_uom, to_uom
      `;
    } else {
      rows = await db.queryAll<UoMConversion>`
        SELECT * FROM uom_conversion ORDER BY model_code, from_uom, to_uom
      `;
    }
    return { conversions: rows };
  }
);
