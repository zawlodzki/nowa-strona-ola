CREATE TABLE checkout_offer_email_requests (
  order_id TEXT PRIMARY KEY REFERENCES checkout_orders(id),
  request_version TEXT NOT NULL,
  request_text TEXT NOT NULL,
  requested_at INTEGER NOT NULL
);
