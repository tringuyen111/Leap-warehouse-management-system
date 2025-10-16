-- Goods Receipt (GR)
CREATE TABLE gr_header (
  id BIGSERIAL PRIMARY KEY,
  doc_number VARCHAR(50) NOT NULL UNIQUE,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  source_type VARCHAR(50) NOT NULL,
  source_doc_number VARCHAR(50),
  partner_id BIGINT REFERENCES partner(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  receipt_date TIMESTAMPTZ,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE gr_detail (
  id BIGSERIAL PRIMARY KEY,
  gr_header_id BIGINT NOT NULL REFERENCES gr_header(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  planned_qty DOUBLE PRECISION NOT NULL,
  received_qty DOUBLE PRECISION NOT NULL DEFAULT 0,
  uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  location_id BIGINT REFERENCES location(id),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  manufacture_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(gr_header_id, line_number)
);

-- Goods Issue (GI)
CREATE TABLE gi_header (
  id BIGSERIAL PRIMARY KEY,
  doc_number VARCHAR(50) NOT NULL UNIQUE,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  source_type VARCHAR(50) NOT NULL,
  source_doc_number VARCHAR(50),
  partner_id BIGINT REFERENCES partner(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  issue_date TIMESTAMPTZ,
  issue_mode VARCHAR(20) NOT NULL DEFAULT 'summary',
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE gi_detail (
  id BIGSERIAL PRIMARY KEY,
  gi_header_id BIGINT NOT NULL REFERENCES gi_header(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  planned_qty DOUBLE PRECISION NOT NULL,
  picked_qty DOUBLE PRECISION NOT NULL DEFAULT 0,
  issued_qty DOUBLE PRECISION NOT NULL DEFAULT 0,
  uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  location_id BIGINT REFERENCES location(id),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(gi_header_id, line_number)
);

-- Inventory Control (IC)
CREATE TABLE ic_header (
  id BIGSERIAL PRIMARY KEY,
  doc_number VARCHAR(50) NOT NULL UNIQUE,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  count_type VARCHAR(50) NOT NULL DEFAULT 'full',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  count_date TIMESTAMPTZ,
  blind_count BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE ic_detail (
  id BIGSERIAL PRIMARY KEY,
  ic_header_id BIGINT NOT NULL REFERENCES ic_header(id) ON DELETE CASCADE,
  location_id BIGINT NOT NULL REFERENCES location(id),
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  system_qty DOUBLE PRECISION NOT NULL DEFAULT 0,
  counted_qty DOUBLE PRECISION,
  uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  counted_by VARCHAR(100),
  counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ic_variance (
  id BIGSERIAL PRIMARY KEY,
  ic_header_id BIGINT NOT NULL REFERENCES ic_header(id),
  ic_detail_id BIGINT NOT NULL REFERENCES ic_detail(id),
  location_id BIGINT NOT NULL REFERENCES location(id),
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  system_qty DOUBLE PRECISION NOT NULL,
  counted_qty DOUBLE PRECISION NOT NULL,
  variance_qty DOUBLE PRECISION NOT NULL,
  uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Putaway
CREATE TABLE putaway_batch (
  id BIGSERIAL PRIMARY KEY,
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  gr_header_id BIGINT REFERENCES gr_header(id),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE putaway_detail (
  id BIGSERIAL PRIMARY KEY,
  putaway_batch_id BIGINT NOT NULL REFERENCES putaway_batch(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  from_location_id BIGINT NOT NULL REFERENCES location(id),
  to_location_id BIGINT REFERENCES location(id),
  suggested_location_id BIGINT REFERENCES location(id),
  qty DOUBLE PRECISION NOT NULL,
  uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(putaway_batch_id, line_number)
);

-- Indexes
CREATE INDEX idx_gr_header_warehouse ON gr_header(warehouse_id);
CREATE INDEX idx_gr_header_status ON gr_header(status);
CREATE INDEX idx_gr_header_source ON gr_header(source_type, source_doc_number);
CREATE INDEX idx_gr_detail_header ON gr_detail(gr_header_id);
CREATE INDEX idx_gr_detail_model ON gr_detail(model_code);

CREATE INDEX idx_gi_header_warehouse ON gi_header(warehouse_id);
CREATE INDEX idx_gi_header_status ON gi_header(status);
CREATE INDEX idx_gi_header_source ON gi_header(source_type, source_doc_number);
CREATE INDEX idx_gi_detail_header ON gi_detail(gi_header_id);
CREATE INDEX idx_gi_detail_model ON gi_detail(model_code);

CREATE INDEX idx_ic_header_warehouse ON ic_header(warehouse_id);
CREATE INDEX idx_ic_header_status ON ic_header(status);
CREATE INDEX idx_ic_detail_header ON ic_detail(ic_header_id);
CREATE INDEX idx_ic_variance_header ON ic_variance(ic_header_id);

CREATE INDEX idx_putaway_batch_warehouse ON putaway_batch(warehouse_id);
CREATE INDEX idx_putaway_batch_status ON putaway_batch(status);
CREATE INDEX idx_putaway_detail_batch ON putaway_detail(putaway_batch_id);
