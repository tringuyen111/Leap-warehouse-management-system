import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CompletePutawayRequest {
  id: number;
  details: {
    line_number: number;
    to_location_id: number;
  }[];
}

// Completes putaway and moves inventory to storage locations.
export const completePutaway = api<CompletePutawayRequest, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/putaway/:id/complete" },
  async (req) => {
    await using tx = await db.begin();

    const batch = await tx.queryRow<{ status: string; warehouse_id: number; batch_number: string }>`
      SELECT status, warehouse_id, batch_number FROM putaway_batch WHERE id = ${req.id}
    `;
    if (!batch) {
      throw APIError.notFound("putaway batch not found");
    }
    if (batch.status === "completed") {
      throw APIError.failedPrecondition("putaway batch already completed");
    }

    for (const detailUpdate of req.details) {
      const detail = await tx.queryRow<{
        model_code: string;
        from_location_id: number;
        qty: number;
        lot_number: string | null;
        serial_number: string | null;
      }>`
        SELECT model_code, from_location_id, qty, lot_number, serial_number
        FROM putaway_detail
        WHERE putaway_batch_id = ${req.id} AND line_number = ${detailUpdate.line_number}
      `;

      if (!detail) continue;

      const modelInfo = await tx.queryRow<{ base_uom_code: string }>`
        SELECT base_uom_code FROM model_goods WHERE code = ${detail.model_code}
      `;

      await tx.exec`
        UPDATE inventory_onhand
        SET qty = qty - ${detail.qty}, last_updated = NOW()
        WHERE warehouse_id = ${batch.warehouse_id}
          AND location_id = ${detail.from_location_id}
          AND model_code = ${detail.model_code}
          AND COALESCE(lot_number, '') = ${detail.lot_number || ''}
          AND COALESCE(serial_number, '') = ${detail.serial_number || ''}
      `;

      const existing = await tx.queryRow<{ qty: number }>`
        SELECT qty FROM inventory_onhand
        WHERE warehouse_id = ${batch.warehouse_id}
          AND location_id = ${detailUpdate.to_location_id}
          AND model_code = ${detail.model_code}
          AND COALESCE(lot_number, '') = ${detail.lot_number || ''}
          AND COALESCE(serial_number, '') = ${detail.serial_number || ''}
      `;

      if (existing) {
        await tx.exec`
          UPDATE inventory_onhand
          SET qty = qty + ${detail.qty}, last_updated = NOW()
          WHERE warehouse_id = ${batch.warehouse_id}
            AND location_id = ${detailUpdate.to_location_id}
            AND model_code = ${detail.model_code}
            AND COALESCE(lot_number, '') = ${detail.lot_number || ''}
            AND COALESCE(serial_number, '') = ${detail.serial_number || ''}
        `;
      } else {
        await tx.exec`
          INSERT INTO inventory_onhand (
            warehouse_id, location_id, model_code, lot_number, serial_number,
            qty, base_uom_code
          )
          VALUES (
            ${batch.warehouse_id}, ${detailUpdate.to_location_id}, ${detail.model_code},
            ${detail.lot_number || null}, ${detail.serial_number || null},
            ${detail.qty}, ${modelInfo!.base_uom_code}
          )
        `;
      }

      await tx.exec`
        INSERT INTO transaction_log (
          transaction_type, doc_number, warehouse_id, location_id, model_code,
          lot_number, serial_number, qty_change, base_uom_code,
          from_location_id, to_location_id
        )
        VALUES (
          'PUTAWAY', ${batch.batch_number}, ${batch.warehouse_id}, ${detailUpdate.to_location_id},
          ${detail.model_code}, ${detail.lot_number || null}, ${detail.serial_number || null},
          ${detail.qty}, ${modelInfo!.base_uom_code}, ${detail.from_location_id}, ${detailUpdate.to_location_id}
        )
      `;

      await tx.exec`
        UPDATE putaway_detail
        SET to_location_id = ${detailUpdate.to_location_id},
            status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE putaway_batch_id = ${req.id} AND line_number = ${detailUpdate.line_number}
      `;
    }

    await tx.exec`
      UPDATE putaway_batch
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${req.id}
    `;

    await tx.commit();

    return { success: true };
  }
);
