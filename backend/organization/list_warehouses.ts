import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Warehouse } from "./types";

interface ListWarehousesRequest {
  branch_id?: Query<number>;
}

interface ListWarehousesResponse {
  warehouses: Warehouse[];
}

// Retrieves all warehouses, optionally filtered by branch.
export const listWarehouses = api<ListWarehousesRequest, ListWarehousesResponse>(
  { expose: true, method: "GET", path: "/api/warehouses" },
  async (req) => {
    let rows: Warehouse[];
    if (req.branch_id) {
      rows = await db.queryAll<Warehouse>`
        SELECT * FROM warehouse 
        WHERE branch_id = ${req.branch_id}
        ORDER BY name
      `;
    } else {
      rows = await db.queryAll<Warehouse>`
        SELECT * FROM warehouse ORDER BY name
      `;
    }
    return { warehouses: rows };
  }
);
