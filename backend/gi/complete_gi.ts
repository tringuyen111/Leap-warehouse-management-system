import { api, APIError } from "encore.dev/api";
import db from "../db";

// Completes a goods issue and updates inventory.
export const completeGI = api<{ id: number }, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/gi/:id/complete" },
  async ({ id }) => {
    await using tx = await db.begin();

    const header = await tx.queryRow<{ status: string; warehouse_id: number; doc_number: string }>`
      SELECT status, warehouse_id, doc_number FROM gi_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("goods issue not found");
    }
    if (header.status !== "picking") {
      throw APIError.failedPrecondition("cannot complete goods issue in current status");
    }

    const details = await tx.queryAll<{
      model_code: string;
      picked_qty: number;
      location_id: number;
      lot_number: string | null;
      serial_number: string | null;
    }>`
      SELECT model_code, picked_qty, location_id, lot_number, serial_number
      FROM gi_detail
      WHERE gi_header_id = ${id}
    `;

    for (const detail of details) {
      if (!detail.location_id) {
        throw APIError.invalidArgument("all items must have a location assigned");
      }

      const modelInfo = await tx.queryRow<{ base_uom_code: string }>`
        SELECT base_uom_code FROM model_goods WHERE code = ${detail.model_code}
      `;

      await tx.exec`
        UPDATE inventory_onhand
        SET qty = qty - ${detail.picked_qty},
            last_updated = NOW()
        WHERE warehouse_id = ${header.warehouse_id}
          AND location_id = ${detail.location_id}
          AND model_code = ${detail.model_code}
          AND COALESCE(lot_number, '') = ${detail.lot_number || ''}
          AND COALESCE(serial_number, '') = ${detail.serial_number || ''}
      `;

      await tx.exec`
        UPDATE gi_detail
        SET issued_qty = picked_qty, updated_at = NOW()
        WHERE gi_header_id = ${id} AND model_code = ${detail.model_code}
      `;

      await tx.exec`
        INSERT INTO transaction_log (
          transaction_type, doc_number, warehouse_id, location_id, model_code,
          lot_number, serial_number, qty_change, base_uom_code
        )
        VALUES (
          'GI', ${header.doc_number}, ${header.warehouse_id}, ${detail.location_id},
          ${detail.model_code}, ${detail.lot_number || null}, ${detail.serial_number || null},
          ${-detail.picked_qty}, ${modelInfo!.base_uom_code}
        )
      `;
    }

    await tx.exec`
      UPDATE gi_header
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;

    await tx.commit();

    return { success: true };
  }
);
