import { api, APIError } from "encore.dev/api";
import db from "../db";

// Completes an inventory count and generates variance report.
export const completeIC = api<{ id: number }, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/ic/:id/complete" },
  async ({ id }) => {
    await using tx = await db.begin();

    const header = await tx.queryRow<{ status: string }>`
      SELECT status FROM ic_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("inventory count not found");
    }
    if (header.status !== "counting") {
      throw APIError.failedPrecondition("cannot complete in current status");
    }

    const details = await tx.queryAll<{
      id: number;
      location_id: number;
      model_code: string;
      lot_number: string | null;
      serial_number: string | null;
      system_qty: number;
      counted_qty: number;
      uom_code: string;
    }>`
      SELECT id, location_id, model_code, lot_number, serial_number,
             system_qty, counted_qty, uom_code
      FROM ic_detail
      WHERE ic_header_id = ${id} AND counted_qty IS NOT NULL
    `;

    for (const detail of details) {
      const varianceQty = detail.counted_qty - detail.system_qty;
      
      if (varianceQty !== 0) {
        await tx.exec`
          INSERT INTO ic_variance (
            ic_header_id, ic_detail_id, location_id, model_code, lot_number,
            serial_number, system_qty, counted_qty, variance_qty, uom_code
          )
          VALUES (
            ${id}, ${detail.id}, ${detail.location_id}, ${detail.model_code},
            ${detail.lot_number || null}, ${detail.serial_number || null},
            ${detail.system_qty}, ${detail.counted_qty}, ${varianceQty}, ${detail.uom_code}
          )
        `;
      }
    }

    await tx.exec`
      UPDATE ic_header
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;

    await tx.commit();

    return { success: true };
  }
);
