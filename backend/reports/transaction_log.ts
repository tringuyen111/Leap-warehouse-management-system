import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface TransactionLogRecord {
  id: number;
  transaction_type: string;
  doc_number: string;
  transaction_date: Date;
  warehouse_id: number;
  location_id: number;
  model_code: string;
  lot_number?: string;
  serial_number?: string;
  qty_change: number;
  base_uom_code: string;
  from_location_id?: number;
  to_location_id?: number;
  partner_id?: number;
  created_by?: string;
  notes?: string;
}

interface TransactionLogRequest {
  warehouse_id?: Query<number>;
  model_code?: Query<string>;
  transaction_type?: Query<string>;
  from_date?: Query<string>;
  to_date?: Query<string>;
}

interface TransactionLogResponse {
  records: TransactionLogRecord[];
}

// Retrieves transaction log with optional filters.
export const getTransactionLog = api<TransactionLogRequest, TransactionLogResponse>(
  { expose: true, method: "GET", path: "/api/reports/transaction-log" },
  async (req) => {
    let query = `SELECT * FROM transaction_log WHERE 1=1`;
    const params: any[] = [];

    if (req.warehouse_id) {
      params.push(req.warehouse_id);
      query += ` AND warehouse_id = $${params.length}`;
    }
    if (req.model_code) {
      params.push(req.model_code);
      query += ` AND model_code = $${params.length}`;
    }
    if (req.transaction_type) {
      params.push(req.transaction_type);
      query += ` AND transaction_type = $${params.length}`;
    }
    if (req.from_date) {
      params.push(req.from_date);
      query += ` AND transaction_date >= $${params.length}::timestamptz`;
    }
    if (req.to_date) {
      params.push(req.to_date);
      query += ` AND transaction_date <= $${params.length}::timestamptz`;
    }

    query += ` ORDER BY transaction_date DESC LIMIT 1000`;

    const rows = await db.rawQueryAll<TransactionLogRecord>(query, ...params);
    return { records: rows };
  }
);
