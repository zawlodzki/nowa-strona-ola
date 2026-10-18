CREATE TABLE checkout_orders (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  owner_hash TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('single', 'bundle')),
  parent_order_id TEXT REFERENCES checkout_orders(id),
  product_codes TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount = 9700),
  currency TEXT NOT NULL CHECK (currency = 'pln'),
  snapshot TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT UNIQUE,
  checkout_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'revoked')),
  paid_at INTEGER,
  review_reason TEXT,
  UNIQUE (owner_hash, request_id),
  CHECK ((kind = 'single' AND parent_order_id IS NULL) OR (kind = 'bundle' AND parent_order_id IS NOT NULL))
);
CREATE INDEX checkout_orders_owner ON checkout_orders(owner_hash);

CREATE UNIQUE INDEX checkout_active_bundle ON checkout_orders(parent_order_id) WHERE kind = 'bundle' AND status != 'expired';
