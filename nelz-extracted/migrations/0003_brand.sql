create table if not exists store_settings (
  id integer primary key,
  shop_name text not null,
  logo text not null default '',
  ink text not null,
  paper text not null,
  accent text not null
);

insert into store_settings (id, shop_name, logo, ink, paper, accent)
values (1, 'Nelz Local Much', '', '#2f2b27', '#f6f3ee', '#9f3b2f')
on conflict (id) do nothing;
