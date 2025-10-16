import { api } from "encore.dev/api";
import db from "../db";
import type { GoodsType } from "./types";

interface ListGoodsTypesResponse {
  goods_types: GoodsType[];
}

// Retrieves all goods types.
export const listGoodsTypes = api<void, ListGoodsTypesResponse>(
  { expose: true, method: "GET", path: "/api/goods-types" },
  async () => {
    const rows = await db.queryAll<GoodsType>`
      SELECT * FROM goods_type ORDER BY name
    `;
    return { goods_types: rows };
  }
);
