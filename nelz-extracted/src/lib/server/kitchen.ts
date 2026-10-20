import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { ActivityItem, Category, Order, OrderStatus, Product, StaffStatus } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

const STAFF_MAX = 2;

const categorySchema = z.enum(CATEGORIES);
const statusSchema = z.enum(["pending", "confirmed", "completed", "cancelled"]);

type ProductRow = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category as Category,
    description: row.description,
    price: Number(row.price),
    image: row.image ?? "",
    available: Boolean(row.available),
  };
}

async function writeActivity(message: string, actor: string) {
  const sql = await getSql();
  await sql`insert into activity (message, actor) values (${message}, ${actor})`;
}

async function requireStaff(userId: string, displayName: string) {
  const sql = await getSql();
  const existing = await sql<{ user_id: string }>`
    select user_id from staff where user_id = ${userId}
  `;
  if (existing.length > 0) return;

  const countRows = await sql<{ n: number }>`select count(*)::int as n from staff`;
  const n = Number(countRows[0]?.n ?? 0);
  if (n >= STAFF_MAX) {
    throw new Error("Kitchen access is limited to two staff accounts.");
  }
  await sql`
    insert into staff (user_id, display_name)
    values (${userId}, ${displayName})
  `;
  await writeActivity(`${displayName || "Staff"} claimed a kitchen seat`, userId);
}

async function staffStatusFor(userId: string): Promise<StaffStatus> {
  const sql = await getSql();
  const seats = await sql<{
    user_id: string;
    display_name: string;
    created_at: string;
  }>`select user_id, display_name, created_at from staff order by created_at`;
  return {
    isStaff: seats.some((s) => s.user_id === userId),
    seatsTaken: seats.length,
    seatsMax: STAFF_MAX,
    seats: seats.map((s) => ({
      userId: s.user_id,
      displayName: s.display_name,
      createdAt: String(s.created_at),
    })),
  };
}

export const listMenu = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<ProductRow>`
    select id, name, category, description, price, image, available
    from products
    where available = true
    order by category, name
  `;
  return rows.map(mapProduct);
});

export const listAllProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      select id, name, category, description, price, image, available
      from products
      order by id
    `;
    return rows.map(mapProduct);
  });

const saveProductSchema = z.object({
  id: z.number().optional(),
  name: z.string().trim().min(1).max(80),
  category: categorySchema,
  description: z.string().trim().max(400),
  price: z.number().int().min(1).max(9999),
  image: z.string().max(1_500_000),
  available: z.boolean(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(saveProductSchema)
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    if (data.id) {
      await sql`
        update products
        set name = ${data.name},
            category = ${data.category},
            description = ${data.description},
            price = ${data.price},
            image = ${data.image},
            available = ${data.available}
        where id = ${data.id}
      `;
      await writeActivity(`Updated ${data.name}`, context.userId);
      return { ok: true as const, id: data.id };
    }
    const inserted = await sql<{ id: number }>`
      insert into products (name, category, description, price, image, available)
      values (${data.name}, ${data.category}, ${data.description}, ${data.price}, ${data.image}, ${data.available})
      returning id
    `;
    const id = Number(inserted[0].id);
    await writeActivity(`Added ${data.name}`, context.userId);
    return { ok: true as const, id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    const found = await sql<{ name: string }>`select name from products where id = ${data.id}`;
    await sql`delete from products where id = ${data.id}`;
    await writeActivity(`Removed ${found[0]?.name ?? "a dish"}`, context.userId);
    return { ok: true as const };
  });

const placeOrderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().max(120),
  notes: z.string().trim().max(400),
  items: z
    .array(
      z.object({
        productId: z.number(),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

export const placeOrder = createServerFn({ method: "POST" })
  .validator(placeOrderSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const products = await sql<ProductRow>`
      select id, name, category, description, price, image, available
      from products
      where available = true
    `;
    const byId = new Map(products.map((p) => [Number(p.id), p]));
    const lines: { productId: number; name: string; price: number; qty: number }[] = [];
    let total = 0;
    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product) throw new Error("One of the dishes is no longer available.");
      lines.push({
        productId: Number(product.id),
        name: product.name,
        price: Number(product.price),
        qty: item.qty,
      });
      total += Number(product.price) * item.qty;
    }
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    await sql`
      insert into orders (id, customer_name, customer_phone, customer_email, notes, total, status)
      values (${id}, ${data.name}, ${data.phone}, ${data.email}, ${data.notes}, ${total}, ${"pending"})
    `;
    for (const line of lines) {
      await sql`
        insert into order_items (order_id, product_id, name, price, qty)
        values (${id}, ${line.productId}, ${line.name}, ${line.price}, ${line.qty})
      `;
    }
    await writeActivity(`New order ${id} from ${data.name}`, "customer");
    return { id, total };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    const orders = await sql<{
      id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      notes: string;
      total: number;
      status: string;
      created_at: string;
    }>`
      select id, customer_name, customer_phone, customer_email, notes, total, status, created_at
      from orders
      order by created_at desc
    `;
    const items = await sql<{
      order_id: string;
      product_id: number | null;
      name: string;
      price: number;
      qty: number;
    }>`
      select order_id, product_id, name, price, qty from order_items
    `;
    const grouped = new Map<string, Order["items"]>();
    for (const item of items) {
      const list = grouped.get(item.order_id) ?? [];
      list.push({
        productId: item.product_id == null ? null : Number(item.product_id),
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty),
      });
      grouped.set(item.order_id, list);
    }
    return orders.map(
      (o): Order => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerEmail: o.customer_email,
        notes: o.notes,
        total: Number(o.total),
        status: o.status as OrderStatus,
        createdAt: String(o.created_at),
        items: grouped.get(o.id) ?? [],
      }),
    );
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), status: statusSchema }))
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    await sql`update orders set status = ${data.status} where id = ${data.id}`;
    await writeActivity(`Order ${data.id} marked ${data.status}`, context.userId);
    return { ok: true as const };
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      message: string;
      actor: string;
      created_at: string;
    }>`
      select id, message, actor, created_at from activity order by created_at desc limit 80
    `;
    return rows.map(
      (r): ActivityItem => ({
        id: Number(r.id),
        message: r.message,
        actor: r.actor,
        createdAt: String(r.created_at),
      }),
    );
  });

export const getStaffStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<StaffStatus> => {
    return staffStatusFor(context.userId);
  });

export const claimStaffSeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ displayName: z.string().max(80) }))
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId, data.displayName || "Staff");
    return staffStatusFor(context.userId);
  });

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const DEFAULT_BRAND = {
  shopName: "Nelz Local Much",
  logo: "",
  ink: "#2f2b27",
  paper: "#f6f3ee",
  accent: "#9f3b2f",
};

export const getBrand = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    shop_name: string;
    logo: string;
    ink: string;
    paper: string;
    accent: string;
  }>`select shop_name, logo, ink, paper, accent from store_settings where id = 1`;
  const row = rows[0];
  if (!row) return DEFAULT_BRAND;
  return {
    shopName: row.shop_name,
    logo: row.logo ?? "",
    ink: row.ink,
    paper: row.paper,
    accent: row.accent,
  };
});

export const saveBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      shopName: z.string().trim().min(2).max(60),
      logo: z.string().max(1_200_000),
      ink: hex,
      paper: hex,
      accent: hex,
    }),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId, "Staff");
    const sql = await getSql();
    await sql`
      insert into store_settings (id, shop_name, logo, ink, paper, accent)
      values (1, ${data.shopName}, ${data.logo}, ${data.ink}, ${data.paper}, ${data.accent})
      on conflict (id) do update set
        shop_name = excluded.shop_name,
        logo = excluded.logo,
        ink = excluded.ink,
        paper = excluded.paper,
        accent = excluded.accent
    `;
    await writeActivity(`Updated shop look: ${data.shopName}`, context.userId);
    return { ok: true as const };
  });

