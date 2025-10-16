export interface Organization {
  id: number;
  code: string;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Branch {
  id: number;
  organization_id: number;
  code: string;
  name: string;
  address?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Warehouse {
  id: number;
  branch_id: number;
  code: string;
  name: string;
  address?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Location {
  id: number;
  warehouse_id: number;
  code: string;
  name: string;
  zone?: string;
  bin?: string;
  capacity?: number;
  allowed_goods_type?: string;
  allow_mixed_lot: boolean;
  location_type: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
