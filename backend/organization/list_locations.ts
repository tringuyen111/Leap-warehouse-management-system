import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Location } from "./types";

interface ListLocationsRequest {
  warehouse_id?: Query<number>;
}

interface ListLocationsResponse {
  locations: Location[];
}

// Retrieves all locations, optionally filtered by warehouse.
export const listLocations = api<ListLocationsRequest, ListLocationsResponse>(
  { expose: true, method: "GET", path: "/api/locations" },
  async (req) => {
    let rows: Location[];
    if (req.warehouse_id) {
      rows = await db.queryAll<Location>`
        SELECT * FROM location 
        WHERE warehouse_id = ${req.warehouse_id}
        ORDER BY zone, bin, code
      `;
    } else {
      rows = await db.queryAll<Location>`
        SELECT * FROM location ORDER BY zone, bin, code
      `;
    }
    return { locations: rows };
  }
);
