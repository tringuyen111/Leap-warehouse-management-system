import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateWarehouseRequest {
  branch_id: number;
  code: string;
  name: string;
  address?: string;
}

// Creates a new warehouse.
export const createWarehouse = api<CreateWarehouseRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/warehouses" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM warehouse 
      WHERE branch_id = ${req.branch_id} AND code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("warehouse with this code already exists in branch");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO warehouse (branch_id, code, name, address)
      VALUES (${req.branch_id}, ${req.code}, ${req.name}, ${req.address || null})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
