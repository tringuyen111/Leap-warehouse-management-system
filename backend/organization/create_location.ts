import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateLocationRequest {
  warehouse_id: number;
  code: string;
  name: string;
  zone?: string;
  bin?: string;
  capacity?: number;
  allowed_goods_type?: string;
  allow_mixed_lot: boolean;
  location_type: string;
}

// Creates a new location.
export const createLocation = api<CreateLocationRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/locations" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM location 
      WHERE warehouse_id = ${req.warehouse_id} AND code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("location with this code already exists in warehouse");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO location (
        warehouse_id, code, name, zone, bin, capacity, 
        allowed_goods_type, allow_mixed_lot, location_type
      )
      VALUES (
        ${req.warehouse_id}, ${req.code}, ${req.name}, ${req.zone || null}, 
        ${req.bin || null}, ${req.capacity || null}, ${req.allowed_goods_type || null}, 
        ${req.allow_mixed_lot}, ${req.location_type}
      )
      RETURNING id
    `;

    return { id: row!.id };
  }
);
