import { api } from "encore.dev/api";
import db from "../db";

interface CreateICRequest {
  warehouse_id: number;
  count_type: string;
  blind_count: boolean;
  location_ids?: number[];
  notes?: string;
}

// Creates a new inventory count and takes a snapshot.
export const createIC = api<CreateICRequest, { id: number; doc_number: string }>(
  { expose: true, method: "POST", path: "/api/ic" },
  async (req) => {
    await using tx = await db.begin();

    const docNumber = `IC-${Date.now()}`;
    
    const header = await tx.queryRow<{ id: number }>`
      INSERT INTO ic_header (doc_number, warehouse_id, count_type, blind_count, notes)
      VALUES (${docNumber}, ${req.warehouse_id}, ${req.count_type}, ${req.blind_count}, ${req.notes || null})
      RETURNING id
    `;

    let onhandRecords;
    if (req.location_ids && req.location_ids.length > 0) {
      const locationList = req.location_ids.join(',');
      onhandRecords = await tx.rawQueryAll<{
        location_id: number;
        model_code: string;
        lot_number: string | null;
        serial_number: string | null;
        qty: number;
        base_uom_code: string;
      }>(`
        SELECT location_id, model_code, lot_number, serial_number, qty, base_uom_code
        FROM inventory_onhand
        WHERE warehouse_id = $1 AND location_id IN (${locationList})
      `, req.warehouse_id);
    } else {
      onhandRecords = await tx.queryAll<{
        location_id: number;
        model_code: string;
        lot_number: string | null;
        serial_number: string | null;
        qty: number;
        base_uom_code: string;
      }>`
        SELECT location_id, model_code, lot_number, serial_number, qty, base_uom_code
        FROM inventory_onhand
        WHERE warehouse_id = ${req.warehouse_id}
      `;
    }

    for (const record of onhandRecords) {
      await tx.exec`
        INSERT INTO inventory_snapshot (
          ic_header_id, warehouse_id, location_id, model_code, lot_number,
          serial_number, qty, base_uom_code
        )
        VALUES (
          ${header!.id}, ${req.warehouse_id}, ${record.location_id}, ${record.model_code},
          ${record.lot_number || null}, ${record.serial_number || null}, ${record.qty}, ${record.base_uom_code}
        )
      `;

      await tx.exec`
        INSERT INTO ic_detail (
          ic_header_id, location_id, model_code, lot_number, serial_number,
          system_qty, uom_code
        )
        VALUES (
          ${header!.id}, ${record.location_id}, ${record.model_code}, ${record.lot_number || null},
          ${record.serial_number || null}, ${record.qty}, ${record.base_uom_code}
        )
      `;
    }

    await tx.exec`
      UPDATE ic_header SET status = 'created', updated_at = NOW()
      WHERE id = ${header!.id}
    `;

    await tx.commit();

    return { id: header!.id, doc_number: docNumber };
  }
);
