import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreatePartnerRequest {
  code: string;
  name: string;
  partner_type: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

// Creates a new partner.
export const createPartner = api<CreatePartnerRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/partners" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM partner WHERE code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("partner with this code already exists");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO partner (code, name, partner_type, address, contact_person, phone, email)
      VALUES (
        ${req.code}, ${req.name}, ${req.partner_type}, ${req.address || null}, 
        ${req.contact_person || null}, ${req.phone || null}, ${req.email || null}
      )
      RETURNING id
    `;

    return { id: row!.id };
  }
);
