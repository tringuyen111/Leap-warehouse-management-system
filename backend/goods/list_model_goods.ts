import { api } from "encore.dev/api";
import db from "../db";
import type { ModelGoods } from "./types";

interface ListModelGoodsResponse {
  model_goods: ModelGoods[];
}

// Retrieves all model goods.
export const listModelGoods = api<void, ListModelGoodsResponse>(
  { expose: true, method: "GET", path: "/api/model-goods" },
  async () => {
    const rows = await db.queryAll<ModelGoods>`
      SELECT * FROM model_goods ORDER BY name
    `;
    return { model_goods: rows };
  }
);
