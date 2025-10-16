import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateModelGoodsRequest {
  code: string;
  name: string;
  description?: string;
  goods_type_id?: number;
  tracking_type: string;
  base_uom_code: string;
  pack_only: boolean;
  expiry_required: boolean;
}

// Creates a new model goods.
export const createModelGoods = api<CreateModelGoodsRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/model-goods" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM model_goods WHERE code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("model goods with this code already exists");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO model_goods (
        code, name, description, goods_type_id, tracking_type,
        base_uom_code, pack_only, expiry_required
      )
      VALUES (
        ${req.code}, ${req.name}, ${req.description || null}, ${req.goods_type_id || null},
        ${req.tracking_type}, ${req.base_uom_code}, ${req.pack_only}, ${req.expiry_required}
      )
      RETURNING id
    `;

    return { id: row!.id };
  }
);
