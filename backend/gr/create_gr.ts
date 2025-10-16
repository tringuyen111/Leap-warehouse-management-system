import { api } from "encore.dev/api";
import db from "../db";

interface CreateGRRequest {
  warehouse_id: number;
  source_type: string;
  source_doc_number?: string;
  partner_id?: number;
  notes?: string;
  details: {
    model_code: string;
    planned_qty: number;
    uom_code: string;
    notes?: string;
  }[];
}

// Creates a new goods receipt.
export const createGR = api<CreateGRRequest, { id: number; doc_number: string }>(
  { expose: true, method: "POST", path: "/api/gr" },
  async (req) => {
    await using tx = await db.begin();

    const docNumber = `GR-${Date.now()}`;
    
    const header = await tx.queryRow<{ id: number }>`
      INSERT INTO gr_header (doc_number, warehouse_id, source_type, source_doc_number, partner_id, notes)
      VALUES (${docNumber}, ${req.warehouse_id}, ${req.source_type}, ${req.source_doc_number || null}, 
              ${req.partner_id || null}, ${req.notes || null})
      RETURNING id
    `;

    for (let i = 0; i < req.details.length; i++) {
      const detail = req.details[i];
      await tx.exec`
        INSERT INTO gr_detail (gr_header_id, line_number, model_code, planned_qty, uom_code, notes)
        VALUES (${header!.id}, ${i + 1}, ${detail.model_code}, ${detail.planned_qty}, 
                ${detail.uom_code}, ${detail.notes || null})
      `;
    }

    await tx.commit();

    return { id: header!.id, doc_number: docNumber };
  }
);
