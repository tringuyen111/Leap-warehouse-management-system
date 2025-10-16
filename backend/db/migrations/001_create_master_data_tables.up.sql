-- Organization Structure
CREATE TABLE organization (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branch (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE TABLE warehouse (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branch(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(branch_id, code)
);

CREATE TABLE location (
  id BIGSERIAL PRIMARY KEY,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  zone VARCHAR(50),
  bin VARCHAR(50),
  capacity DOUBLE PRECISION,
  allowed_goods_type VARCHAR(50),
  allow_mixed_lot BOOLEAN NOT NULL DEFAULT false,
  location_type VARCHAR(50) NOT NULL DEFAULT 'storage',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(warehouse_id, code)
);

-- Goods Catalog
CREATE TABLE goods_type (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE model_goods (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goods_type_id BIGINT REFERENCES goods_type(id),
  tracking_type VARCHAR(20) NOT NULL DEFAULT 'none',
  base_uom_code VARCHAR(20) NOT NULL,
  pack_only BOOLEAN NOT NULL DEFAULT false,
  expiry_required BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unit of Measure
CREATE TABLE uom (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE uom_conversion (
  id BIGSERIAL PRIMARY KEY,
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  from_uom VARCHAR(20) NOT NULL REFERENCES uom(code),
  to_uom VARCHAR(20) NOT NULL REFERENCES uom(code),
  factor DOUBLE PRECISION NOT NULL,
  rounding_mode VARCHAR(20) NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_code, from_uom, to_uom)
);

-- Partners
CREATE TABLE partner (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  partner_type VARCHAR(20) NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_branch_org ON branch(organization_id);
CREATE INDEX idx_warehouse_branch ON warehouse(branch_id);
CREATE INDEX idx_location_warehouse ON location(warehouse_id);
CREATE INDEX idx_location_zone ON location(zone);
CREATE INDEX idx_model_goods_type ON model_goods(goods_type_id);
CREATE INDEX idx_model_tracking ON model_goods(tracking_type);
CREATE INDEX idx_partner_type ON partner(partner_type);
