import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Partner } from "./types";

interface ListPartnersRequest {
  partner_type?: Query<string>;
}

interface ListPartnersResponse {
  partners: Partner[];
}

// Retrieves all partners, optionally filtered by type.
export const listPartners = api<ListPartnersRequest, ListPartnersResponse>(
  { expose: true, method: "GET", path: "/api/partners" },
  async (req) => {
    let rows: Partner[];
    if (req.partner_type) {
      rows = await db.queryAll<Partner>`
        SELECT * FROM partner 
        WHERE partner_type = ${req.partner_type}
        ORDER BY name
      `;
    } else {
      rows = await db.queryAll<Partner>`
        SELECT * FROM partner ORDER BY name
      `;
    }
    return { partners: rows };
  }
);
