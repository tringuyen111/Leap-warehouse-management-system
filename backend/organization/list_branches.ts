import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Branch } from "./types";

interface ListBranchesRequest {
  organization_id?: Query<number>;
}

interface ListBranchesResponse {
  branches: Branch[];
}

// Retrieves all branches, optionally filtered by organization.
export const listBranches = api<ListBranchesRequest, ListBranchesResponse>(
  { expose: true, method: "GET", path: "/api/branches" },
  async (req) => {
    let rows: Branch[];
    if (req.organization_id) {
      rows = await db.queryAll<Branch>`
        SELECT * FROM branch 
        WHERE organization_id = ${req.organization_id}
        ORDER BY name
      `;
    } else {
      rows = await db.queryAll<Branch>`
        SELECT * FROM branch ORDER BY name
      `;
    }
    return { branches: rows };
  }
);
