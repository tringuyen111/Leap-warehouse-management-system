export interface GRHeader {
  id: number;
  doc_number: string;
  warehouse_id: number;
  source_type: string;
  source_doc_number?: string;
  partner_id?: number;
  status: string;
  receipt_date?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  notes?: string;
}

export interface GRDetail {
  id: number;
  gr_header_id: number;
  line_number: number;
  model_code: string;
  planned_qty: number;
  received_qty: number;
  uom_code: string;
  location_id?: number;
  lot_number?: string;
  serial_number?: string;
  manufacture_date?: Date;
  expiry_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
