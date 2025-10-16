import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CountICRequest {
  id: number;
  counts: {
    detail_id: number;
    counted_qty: number;
    counted_by: string;
  }[];
}

// Updates inventory count with counted quantities.
export const countIC = api<CountICRequest, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/ic/:id/count" },
  async (req) => {
    await using tx = await db.begin();

    const header = await tx.queryRow<{ status: string }>`
      SELECT status FROM ic_header WHERE id = ${req.id}
    `;
    if (!header) {
      throw APIError.notFound("inventory count not found");
    }
    if (header.status !== "created" && header.status !== "counting") {
      throw APIError.failedPrecondition("cannot count in current status");
    }

    for (const count of req.counts) {
      await tx.exec`
        UPDATE ic_detail
        SET counted_qty = ${count.counted_qty},
            counted_by = ${count.counted_by},
            counted_at = NOW(),
            updated_at = NOW()
        WHERE id = ${count.detail_id}
      `;
    }

    await tx.exec`
      UPDATE ic_header
      SET status = 'counting', updated_at = NOW()
      WHERE id = ${req.id}
    `;

    await tx.commit();

    return { success: true };
  }
);
