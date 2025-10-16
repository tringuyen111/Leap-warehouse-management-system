export interface Partner {
  id: number;
  code: string;
  name: string;
  partner_type: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
