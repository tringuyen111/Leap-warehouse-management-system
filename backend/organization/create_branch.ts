import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateBranchRequest {
  organization_id: number;
  code: string;
  name: string;
  address?: string;
}

// Creates a new branch.
export const createBranch = api<CreateBranchRequest, { id: number }>(
  { expose: true, method: "POST", path: "/api/branches" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM branch 
      WHERE organization_id = ${req.organization_id} AND code = ${req.code}
    `;
    if (existing) {
      throw APIError.alreadyExists("branch with this code already exists in organization");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO branch (organization_id, code, name, address)
      VALUES (${req.organization_id}, ${req.code}, ${req.name}, ${req.address || null})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
