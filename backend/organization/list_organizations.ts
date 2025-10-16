import { api } from "encore.dev/api";
import db from "../db";
import type { Organization } from "./types";

interface ListOrganizationsResponse {
  organizations: Organization[];
}

// Retrieves all organizations.
export const listOrganizations = api<void, ListOrganizationsResponse>(
  { expose: true, method: "GET", path: "/api/organizations" },
  async () => {
    const rows = await db.queryAll<Organization>`
      SELECT * FROM organization ORDER BY name
    `;
    return { organizations: rows };
  }
);
