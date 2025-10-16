import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateGoodsTypeRequest {
  code: string;
  name: string;
  description?: string;
}

// Creates a new goods type.
export const createGoodsType = api<CreateGoodsTypeRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/goods-types" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM goods_type WHERE code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("goods type with this code already exists");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO goods_type (code, name, description)
      VALUES (${req.code}, ${req.name}, ${req.description || null})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
