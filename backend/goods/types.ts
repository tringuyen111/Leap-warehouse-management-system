export interface GoodsType {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ModelGoods {
  id: number;
  code: string;
  name: string;
  description?: string;
  goods_type_id?: number;
  tracking_type: string;
  base_uom_code: string;
  pack_only: boolean;
  expiry_required: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UoM {
  id: number;
  code: string;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UoMConversion {
  id: number;
  model_code: string;
  from_uom: string;
  to_uom: string;
  factor: number;
  rounding_mode: string;
  created_at: Date;
  updated_at: Date;
}
