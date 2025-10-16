export interface GIHeader {
  id: number;
  doc_number: string;
  warehouse_id: number;
  source_type: string;
  source_doc_number?: string;
  partner_id?: number;
  status: string;
  issue_date?: Date;
  issue_mode: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  notes?: string;
}

export interface GIDetail {
  id: number;
  gi_header_id: number;
  line_number: number;
  model_code: string;
  planned_qty: number;
  picked_qty: number;
  issued_qty: number;
  uom_code: string;
  location_id?: number;
  lot_number?: string;
  serial_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
