import { api } from "encore.dev/api";
import db from "../db";

interface CreateGIRequest {
  warehouse_id: number;
  source_type: string;
  source_doc_number?: string;
  partner_id?: number;
  issue_mode: string;
  notes?: string;
  details: {
    model_code: string;
    planned_qty: number;
    uom_code: string;
    notes?: string;
  }[];
}

// Creates a new goods issue and reserves inventory.
export const createGI = api<CreateGIRequest, { id: number; doc_number: string }>(
  { expose: true, method: "POST", path: "/api/gi" },
  async (req) => {
    await using tx = await db.begin();

    const docNumber = `GI-${Date.now()}`;
    
    const header = await tx.queryRow<{ id: number }>`
      INSERT INTO gi_header (doc_number, warehouse_id, source_type, source_doc_number, 
                            partner_id, issue_mode, notes)
      VALUES (${docNumber}, ${req.warehouse_id}, ${req.source_type}, ${req.source_doc_number || null},
              ${req.partner_id || null}, ${req.issue_mode}, ${req.notes || null})
      RETURNING id
    `;

    for (let i = 0; i < req.details.length; i++) {
      const detail = req.details[i];
      await tx.exec`
        INSERT INTO gi_detail (gi_header_id, line_number, model_code, planned_qty, uom_code, notes)
        VALUES (${header!.id}, ${i + 1}, ${detail.model_code}, ${detail.planned_qty},
                ${detail.uom_code}, ${detail.notes || null})
      `;
    }

    await tx.exec`
      UPDATE gi_header SET status = 'created', updated_at = NOW()
      WHERE id = ${header!.id}
    `;

    await tx.commit();

    return { id: header!.id, doc_number: docNumber };
  }
);
