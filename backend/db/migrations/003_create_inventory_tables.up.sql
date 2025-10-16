-- Inventory On-hand
CREATE TABLE inventory_onhand (
  id BIGSERIAL PRIMARY KEY,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  location_id BIGINT NOT NULL REFERENCES location(id),
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  qty DOUBLE PRECISION NOT NULL DEFAULT 0,
  base_uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  manufacture_date DATE,
  expiry_date DATE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(warehouse_id, location_id, model_code, COALESCE(lot_number, ''), COALESCE(serial_number, ''))
);

-- Inventory Reservations
CREATE TABLE inventory_reservation (
  id BIGSERIAL PRIMARY KEY,
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  location_id BIGINT NOT NULL REFERENCES location(id),
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  reserved_qty DOUBLE PRECISION NOT NULL DEFAULT 0,
  base_uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  reservation_type VARCHAR(50) NOT NULL,
  reservation_doc_number VARCHAR(50) NOT NULL,
  reservation_line_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Transaction Log
CREATE TABLE transaction_log (
  id BIGSERIAL PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL,
  doc_number VARCHAR(50) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  location_id BIGINT NOT NULL REFERENCES location(id),
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  qty_change DOUBLE PRECISION NOT NULL,
  base_uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  from_location_id BIGINT REFERENCES location(id),
  to_location_id BIGINT REFERENCES location(id),
  partner_id BIGINT REFERENCES partner(id),
  created_by VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory Snapshot (for IC)
CREATE TABLE inventory_snapshot (
  id BIGSERIAL PRIMARY KEY,
  ic_header_id BIGINT NOT NULL REFERENCES ic_header(id),
  warehouse_id BIGINT NOT NULL REFERENCES warehouse(id),
  location_id BIGINT NOT NULL REFERENCES location(id),
  model_code VARCHAR(50) NOT NULL REFERENCES model_goods(code),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  qty DOUBLE PRECISION NOT NULL,
  base_uom_code VARCHAR(20) NOT NULL REFERENCES uom(code),
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_onhand_warehouse ON inventory_onhand(warehouse_id);
CREATE INDEX idx_onhand_location ON inventory_onhand(location_id);
CREATE INDEX idx_onhand_model ON inventory_onhand(model_code);
CREATE INDEX idx_onhand_lot ON inventory_onhand(lot_number);
CREATE INDEX idx_onhand_serial ON inventory_onhand(serial_number);
CREATE INDEX idx_onhand_expiry ON inventory_onhand(expiry_date);

CREATE INDEX idx_reservation_warehouse ON inventory_reservation(warehouse_id);
CREATE INDEX idx_reservation_location ON inventory_reservation(location_id);
CREATE INDEX idx_reservation_model ON inventory_reservation(model_code);
CREATE INDEX idx_reservation_doc ON inventory_reservation(reservation_doc_number);

CREATE INDEX idx_transaction_log_type ON transaction_log(transaction_type);
CREATE INDEX idx_transaction_log_doc ON transaction_log(doc_number);
CREATE INDEX idx_transaction_log_date ON transaction_log(transaction_date);
CREATE INDEX idx_transaction_log_warehouse ON transaction_log(warehouse_id);
CREATE INDEX idx_transaction_log_model ON transaction_log(model_code);

CREATE INDEX idx_snapshot_ic ON inventory_snapshot(ic_header_id);
CREATE INDEX idx_snapshot_warehouse ON inventory_snapshot(warehouse_id);
