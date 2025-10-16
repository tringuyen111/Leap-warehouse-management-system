export interface ICHeader {
  id: number;
  doc_number: string;
  warehouse_id: number;
  count_type: string;
  status: string;
  count_date?: Date;
  blind_count: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  notes?: string;
}

export interface ICDetail {
  id: number;
  ic_header_id: number;
  location_id: number;
  model_code: string;
  lot_number?: string;
  serial_number?: string;
  system_qty: number;
  counted_qty?: number;
  uom_code: string;
  counted_by?: string;
  counted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICVariance {
  id: number;
  ic_header_id: number;
  ic_detail_id: number;
  location_id: number;
  model_code: string;
  lot_number?: string;
  serial_number?: string;
  system_qty: number;
  counted_qty: number;
  variance_qty: number;
  uom_code: string;
  created_at: Date;
}
