create table orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  user_id uuid references profiles(id),
  quantity integer not null,
  price numeric not null,
  order_timestamp timestamptz not null default now(),
  product_category text,
  product_name text
); 