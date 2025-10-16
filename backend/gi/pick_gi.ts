import { api, APIError } from "encore.dev/api";
import db from "../db";

interface PickGIRequest {
  id: number;
  details: {
    line_number: number;
    picked_qty: number;
    location_id: number;
    lot_number?: string;
    serial_number?: string;
  }[];
}

// Updates goods issue with picked quantities.
export const pickGI = api<PickGIRequest, { success: boolean }>(
  { expose: true, method: "POST", path: "/api/gi/:id/pick" },
  async (req) => {
    await using tx = await db.begin();

    const header = await tx.queryRow<{ status: string }>`
      SELECT status FROM gi_header WHERE id = ${req.id}
    `;
    if (!header) {
      throw APIError.notFound("goods issue not found");
    }
    if (header.status !== "created" && header.status !== "picking") {
      throw APIError.failedPrecondition("cannot pick goods issue in current status");
    }

    for (const detail of req.details) {
      await tx.exec`
        UPDATE gi_detail
        SET picked_qty = ${detail.picked_qty},
            location_id = ${detail.location_id},
            lot_number = ${detail.lot_number || null},
            serial_number = ${detail.serial_number || null},
            updated_at = NOW()
        WHERE gi_header_id = ${req.id} AND line_number = ${detail.line_number}
      `;
    }

    await tx.exec`
      UPDATE gi_header
      SET status = 'picking', updated_at = NOW()
      WHERE id = ${req.id}
    `;

    await tx.commit();

    return { success: true };
  }
);
