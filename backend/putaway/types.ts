export interface PutawayBatch {
  id: number;
  batch_number: string;
  warehouse_id: number;
  gr_header_id?: number;
  status: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  notes?: string;
}

export interface PutawayDetail {
  id: number;
  putaway_batch_id: number;
  line_number: number;
  model_code: string;
  from_location_id: number;
  to_location_id?: number;
  suggested_location_id?: number;
  qty: number;
  uom_code: string;
  lot_number?: string;
  serial_number?: string;
  status: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
