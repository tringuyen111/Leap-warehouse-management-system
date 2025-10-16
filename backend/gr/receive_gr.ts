import { api, APIError } from "encore.dev/api";
import db from "../db";

interface ReceiveGRRequest {
  id: number;
  details: {
    line_number: number;
    received_qty: number;
    location_id: number;
    lot_number?: string;
    serial_number?: string;
    manufacture_date?: Date;
    expiry_date?: Date;
  }[];
}

// Updates goods receipt with received quantities.
export const receiveGR = api<ReceiveGRRequest, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/gr/:id/receive" },
  async (req) => {
    await using tx = await db.begin();

    const header = await tx.queryRow<{ status: string }>`
      SELECT status FROM gr_header WHERE id = ${req.id}
    `;
    if (!header) {
      throw APIError.notFound("goods receipt not found");
    }
    if (header.status !== "draft" && header.status !== "receiving") {
      throw APIError.failedPrecondition("cannot receive goods receipt in current status");
    }

    for (const detail of req.details) {
      await tx.exec`
        UPDATE gr_detail
        SET received_qty = ${detail.received_qty},
            location_id = ${detail.location_id},
            lot_number = ${detail.lot_number || null},
            serial_number = ${detail.serial_number || null},
            manufacture_date = ${detail.manufacture_date || null},
            expiry_date = ${detail.expiry_date || null},
            updated_at = NOW()
        WHERE gr_header_id = ${req.id} AND line_number = ${detail.line_number}
      `;
    }

    await tx.exec`
      UPDATE gr_header
      SET status = 'receiving', updated_at = NOW()
      WHERE id = ${req.id}
    `;

    await tx.commit();

    return { success: true };
  }
);
