import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateOrganizationRequest {
  code: string;
  name: string;
}

// Creates a new organization.
export const createOrganization = api<CreateOrganizationRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/organizations" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM organization WHERE code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("organization with this code already exists");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO organization (code, name)
      VALUES (${req.code}, ${req.name})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
