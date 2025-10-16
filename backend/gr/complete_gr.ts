import { api, APIError } from "encore.dev/api";
import db from "../db";

// Completes a goods receipt and updates inventory.
export const completeGR = api<{ id: number }, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/gr/:id/complete" },
  async ({ id }) => {
    await using tx = await db.begin();

    const header = await tx.queryRow<{ status: string; warehouse_id: number; doc_number: string }>`
      SELECT status, warehouse_id, doc_number FROM gr_header WHERE id = ${id}
    `;
    if (!header) {
      throw APIError.notFound("goods receipt not found");
    }
    if (header.status !== "receiving") {
      throw APIError.failedPrecondition("cannot complete goods receipt in current status");
    }

    const details = await tx.queryAll<{
      model_code: string;
      received_qty: number;
      location_id: number;
      lot_number: string | null;
      serial_number: string | null;
      manufacture_date: Date | null;
      expiry_date: Date | null;
    }>`
      SELECT model_code, received_qty, location_id, lot_number, serial_number, 
             manufacture_date, expiry_date
      FROM gr_detail
      WHERE gr_header_id = ${id}
    `;

    for (const detail of details) {
      if (!detail.location_id) {
        throw APIError.invalidArgument("all items must have a location assigned");
      }

      const modelInfo = await tx.queryRow<{ base_uom_code: string }>`
        SELECT base_uom_code FROM model_goods WHERE code = ${detail.model_code}
      `;

      const existing = await tx.queryRow<{ qty: number }>`
        SELECT qty FROM inventory_onhand
        WHERE warehouse_id = ${header.warehouse_id}
          AND location_id = ${detail.location_id}
          AND model_code = ${detail.model_code}
          AND COALESCE(lot_number, '') = ${detail.lot_number || ''}
          AND COALESCE(serial_number, '') = ${detail.serial_number || ''}
      `;

      if (existing) {
        await tx.exec`
          UPDATE inventory_onhand
          SET qty = qty + ${detail.received_qty},
              last_updated = NOW()
          WHERE warehouse_id = ${header.warehouse_id}
            AND location_id = ${detail.location_id}
            AND model_code = ${detail.model_code}
            AND COALESCE(lot_number, '') = ${detail.lot_number || ''}
            AND COALESCE(serial_number, '') = ${detail.serial_number || ''}
        `;
      } else {
        await tx.exec`
          INSERT INTO inventory_onhand (
            warehouse_id, location_id, model_code, lot_number, serial_number,
            qty, base_uom_code, manufacture_date, expiry_date
          )
          VALUES (
            ${header.warehouse_id}, ${detail.location_id}, ${detail.model_code}, 
            ${detail.lot_number || null}, ${detail.serial_number || null},
            ${detail.received_qty}, ${modelInfo!.base_uom_code}, 
            ${detail.manufacture_date || null}, ${detail.expiry_date || null}
          )
        `;
      }

      await tx.exec`
        INSERT INTO transaction_log (
          transaction_type, doc_number, warehouse_id, location_id, model_code,
          lot_number, serial_number, qty_change, base_uom_code
        )
        VALUES (
          'GR', ${header.doc_number}, ${header.warehouse_id}, ${detail.location_id},
          ${detail.model_code}, ${detail.lot_number || null}, ${detail.serial_number || null},
          ${detail.received_qty}, ${modelInfo!.base_uom_code}
        )
      `;
    }

    await tx.exec`
      UPDATE gr_header
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;

    await tx.commit();

    return { success: true };
  }
);
