create table if not exists products (
  id serial primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price integer not null,
  image text not null default '',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null default '',
  notes text not null default '',
  total integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id serial primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id integer,
  name text not null,
  price integer not null,
  qty integer not null
);

create index if not exists order_items_order_id_idx on order_items (order_id);

create table if not exists staff (
  user_id text primary key,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists activity (
  id serial primary key,
  message text not null,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);

create index if not exists activity_created_at_idx on activity (created_at desc);

insert into products (name, category, description, price, image, available) values
  ('Herb Roasted Chicken', 'mains', 'Free-range chicken with garden herbs, roasted roots and pan jus.', 185, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', true),
  ('Seasonal Grain Bowl', 'mains', 'Farro, roasted vegetables, soft egg, tahini and toasted seeds.', 145, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', true),
  ('Beef Short Rib', 'mains', 'Slow-cooked short rib with creamy polenta and braised greens.', 225, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', true),
  ('Catch of the Day', 'mains', 'Market fish, lemon butter, fennel and new potatoes.', 210, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80', true),
  ('Tomato and Burrata', 'starters', 'Heirloom tomatoes, burrata, basil oil and toasted sourdough.', 95, 'https://images.unsplash.com/photo-1608897013039-887f21d8c41a?w=800&q=80', true),
  ('Soup of the Day', 'starters', 'Small-batch soup from the morning harvest. Ask for today''s flavour.', 75, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80', true),
  ('Crispy Potatoes', 'sides', 'Twice-cooked potatoes with rosemary salt and aioli.', 55, 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&q=80', true),
  ('Garden Greens', 'sides', 'Mixed leaves, soft herbs, lemon vinaigrette and toasted almonds.', 65, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', true),
  ('Chocolate Tart', 'desserts', 'Dark chocolate tart with sea salt and creme fraiche.', 85, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80', true),
  ('Seasonal Fruit', 'desserts', 'Local fruit with honey and toasted oats.', 70, 'https://images.unsplash.com/photo-1564093497595-402620b72aec?w=800&q=80', true),
  ('House Lemonade', 'drinks', 'Freshly squeezed with mint and ginger.', 45, 'https://images.unsplash.com/photo-1523677011783-c91d1bbe2fdc?w=800&q=80', true),
  ('Filter Coffee', 'drinks', 'Single-origin filter, black or with milk.', 35, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', true);

insert into activity (message, actor) values
  ('Kitchen opened with the seasonal menu', 'system');
