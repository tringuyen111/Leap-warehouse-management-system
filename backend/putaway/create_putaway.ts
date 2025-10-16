import { api } from "encore.dev/api";
import db from "../db";

interface CreatePutawayRequest {
  warehouse_id: number;
  gr_header_id?: number;
  notes?: string;
  details: {
    model_code: string;
    from_location_id: number;
    qty: number;
    uom_code: string;
    lot_number?: string;
    serial_number?: string;
  }[];
}

// Creates a new putaway batch.
export const createPutaway = api<CreatePutawayRequest, { id: number; batch_number: string }>(
  { expose: true, method: "POST", path: "/api/putaway" },
  async (req) => {
    await using tx = await db.begin();

    const batchNumber = `PW-${Date.now()}`;
    
    const batch = await tx.queryRow<{ id: number }>`
      INSERT INTO putaway_batch (batch_number, warehouse_id, gr_header_id, notes)
      VALUES (${batchNumber}, ${req.warehouse_id}, ${req.gr_header_id || null}, ${req.notes || null})
      RETURNING id
    `;

    for (let i = 0; i < req.details.length; i++) {
      const detail = req.details[i];
      await tx.exec`
        INSERT INTO putaway_detail (
          putaway_batch_id, line_number, model_code, from_location_id,
          qty, uom_code, lot_number, serial_number
        )
        VALUES (
          ${batch!.id}, ${i + 1}, ${detail.model_code}, ${detail.from_location_id},
          ${detail.qty}, ${detail.uom_code}, ${detail.lot_number || null}, ${detail.serial_number || null}
        )
      `;
    }

    await tx.commit();

    return { id: batch!.id, batch_number: batchNumber };
  }
);
