import { api, APIError } from "encore.dev/api";
import db from "../db";

interface LocationSuggestion {
  location_id: number;
  location_code: string;
  zone?: string;
  bin?: string;
  capacity?: number;
  current_qty: number;
  available_capacity: number;
  score: number;
}

interface SuggestLocationsResponse {
  suggestions: LocationSuggestion[];
}

// Generates location suggestions for putaway using rule-based logic.
export const suggestLocations = api<{ batch_id: number; line_number: number }, SuggestLocationsResponse>(
  { expose: true, method: "GET", path: "/api/putaway/:batch_id/suggestions/:line_number" },
  async ({ batch_id, line_number }) => {
    const detail = await db.queryRow<{ model_code: string; qty: number }>`
      SELECT model_code, qty FROM putaway_detail
      WHERE putaway_batch_id = ${batch_id} AND line_number = ${line_number}
    `;
    if (!detail) {
      throw APIError.notFound("putaway detail not found");
    }

    const batch = await db.queryRow<{ warehouse_id: number }>`
      SELECT warehouse_id FROM putaway_batch WHERE id = ${batch_id}
    `;

    const modelInfo = await db.queryRow<{ goods_type_id: number | null }>`
      SELECT goods_type_id FROM model_goods WHERE code = ${detail.model_code}
    `;

    let goodsTypeCode: string | null = null;
    if (modelInfo?.goods_type_id) {
      const goodsType = await db.queryRow<{ code: string }>`
        SELECT code FROM goods_type WHERE id = ${modelInfo.goods_type_id}
      `;
      goodsTypeCode = goodsType?.code || null;
    }

    const query = `
      SELECT 
        l.id as location_id,
        l.code as location_code,
        l.zone,
        l.bin,
        l.capacity,
        COALESCE(SUM(io.qty), 0) as current_qty,
        CASE 
          WHEN l.capacity IS NOT NULL THEN l.capacity - COALESCE(SUM(io.qty), 0)
          ELSE 999999
        END as available_capacity,
        CASE
          WHEN l.allowed_goods_type = $3 THEN 100
          WHEN l.allowed_goods_type IS NULL THEN 50
          ELSE 0
        END +
        CASE
          WHEN l.capacity IS NOT NULL THEN (l.capacity - COALESCE(SUM(io.qty), 0)) / NULLIF(l.capacity, 0) * 50
          ELSE 50
        END as score
      FROM location l
      LEFT JOIN inventory_onhand io ON io.location_id = l.id
      WHERE l.warehouse_id = $1
        AND l.status = 'active'
        AND l.location_type = 'storage'
        AND (l.capacity IS NULL OR l.capacity - COALESCE(SUM(io.qty), 0) >= $2)
      GROUP BY l.id, l.code, l.zone, l.bin, l.capacity, l.allowed_goods_type
      ORDER BY score DESC
      LIMIT 10
    `;

    const rows = await db.rawQueryAll<LocationSuggestion>(
      query, 
      batch!.warehouse_id, 
      detail.qty,
      goodsTypeCode
    );

    return { suggestions: rows };
  }
);
