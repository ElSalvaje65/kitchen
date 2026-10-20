import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { formatPrice, formatWhen } from "@/components/format";
import { BrandMark, useBrand } from "@/components/brand";
import {
  claimStaffSeat,
  deleteProduct,
  getStaffStatus,
  listActivity,
  listAllProducts,
  listOrders,
  saveBrand,
  saveProduct,
  updateOrderStatus,
} from "@/lib/server/kitchen";
import type { Category, OrderStatus, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="grid min-h-dvh place-items-center text-muted">Checking access…</div>;
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <AdminApp name={user.displayName || user.primaryEmail || "Staff"} />;
}

function AdminApp({ name }: { name: string }) {
  const qc = useQueryClient();
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => getStaffStatus() });
  const claim = useMutation({
    mutationFn: () => claimStaffSeat({ data: { displayName: name } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (staff.data && !staff.data.isStaff && staff.data.seatsTaken < staff.data.seatsMax) {
      claim.mutate();
    }
    // claim on first visit only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff.data?.isStaff, staff.data?.seatsTaken]);

  if (staff.isLoading) {
    return <div className="grid min-h-dvh place-items-center text-muted">Opening kitchen…</div>;
  }

  if (staff.data && !staff.data.isStaff && staff.data.seatsTaken >= staff.data.seatsMax) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
          <h1 className="font-display text-2xl">Kitchen is full</h1>
          <p className="mt-2 text-sm text-muted">
            Only two staff accounts can manage the store. Ask an existing kitchen member if you need access.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm underline">
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  return <KitchenDesk name={name} />;
}

function KitchenDesk({ name }: { name: string }) {
  const [panel, setPanel] = useState<"dash" | "menu" | "orders" | "log" | "brand">("dash");
  const qc = useQueryClient();
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => listAllProducts() });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => listOrders() });
  const activity = useQuery({ queryKey: ["admin-activity"], queryFn: () => listActivity() });
  const brand = useBrand();

  const revenue = (orders.data ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const pending = (orders.data ?? []).filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-dvh md:flex">
      <aside className="border-b border-border bg-surface md:w-56 md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-4 md:block">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <BrandMark name={brand.shopName} logo={brand.logo} />
            Kitchen
          </Link>
          <div className="flex items-center gap-2 md:mt-8 md:flex-col md:items-stretch">
            {(["dash", "menu", "orders", "brand", "log"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPanel(id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm capitalize",
                  panel === id ? "bg-soft text-fg" : "text-muted hover:bg-soft",
                )}
              >
                {id === "dash" ? "Overview" : id === "log" ? "Activity" : id === "brand" ? "Look" : id}
              </button>
            ))}
          </div>
          <div className="hidden md:mt-auto md:block md:pt-10">
            <p className="mb-2 truncate text-xs text-muted">{name}</p>
            <UserButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8">
        {panel === "dash" ? (
          <section>
            <h1 className="font-display text-3xl">Overview</h1>
            <p className="mt-1 text-sm text-muted">Live kitchen activity</p>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Orders" value={String(orders.data?.length ?? 0)} />
              <Stat label="Revenue" value={formatPrice(revenue)} />
              <Stat label="Dishes" value={String(products.data?.length ?? 0)} />
              <Stat label="Pending" value={String(pending)} />
            </div>
            <h2 className="mt-8 mb-3 font-semibold">Recent orders</h2>
            <OrdersTable
              orders={(orders.data ?? []).slice(0, 8)}
              compact
              onStatus={async (id, status) => {
                await updateOrderStatus({ data: { id, status } });
                void qc.invalidateQueries();
              }}
            />
          </section>
        ) : null}
        {panel === "menu" ? (
          <MenuPanel
            products={products.data ?? []}
            onChange={() => {
              void qc.invalidateQueries({ queryKey: ["admin-products"] });
              void qc.invalidateQueries({ queryKey: ["menu"] });
            }}
          />
        ) : null}
        {panel === "orders" ? (
          <section>
            <h1 className="font-display text-3xl">Orders</h1>
            <div className="mt-6">
              <OrdersTable
                orders={orders.data ?? []}
                onStatus={async (id, status) => {
                  await updateOrderStatus({ data: { id, status } });
                  toast.success("Status updated");
                  void qc.invalidateQueries();
                }}
              />
            </div>
          </section>
        ) : null}
        {panel === "brand" ? <BrandPanel /> : null}
        {panel === "log" ? (
          <section>
            <h1 className="font-display text-3xl">Activity</h1>
            <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {(activity.data ?? []).map((a) => (
                <li key={a.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <span>{a.message}</span>
                  <span className="shrink-0 text-subtle">{formatWhen(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function BrandPanel() {
  const brand = useBrand();
  const qc = useQueryClient();
  const [shopName, setShopName] = useState(brand.shopName);
  const [logo, setLogo] = useState(brand.logo);
  const [ink, setInk] = useState(brand.ink);
  const [paper, setPaper] = useState(brand.paper);
  const [accent, setAccent] = useState(brand.accent);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setShopName(brand.shopName);
    setLogo(brand.logo);
    setInk(brand.ink);
    setPaper(brand.paper);
    setAccent(brand.accent);
  }, [brand.shopName, brand.logo, brand.ink, brand.paper, brand.accent]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveBrand({ data: { shopName, logo, ink, paper, accent } });
      await qc.invalidateQueries({ queryKey: ["brand"] });
      toast.success("Shop look updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-xl">
      <h1 className="font-display text-3xl">Shop look</h1>
      <p className="mt-1 text-sm text-muted">Name, logo, and colours update the public site immediately.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <BrandMark name={shopName} logo={logo} />
          <span className="font-medium">{shopName || "Shop name"}</span>
        </div>
        <label className="block text-sm font-medium">
          Shop name
          <input
            required
            minLength={2}
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Logo
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 800_000) {
                toast.error("Keep the logo under 800KB");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setLogo(String(reader.result ?? ""));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {logo ? (
          <button type="button" className="text-sm text-muted underline" onClick={() => setLogo("")}>
            Remove logo
          </button>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <ColorField label="Ink" value={ink} onChange={setInk} />
          <ColorField label="Paper" value={paper} onChange={setPaper} />
          <ColorField label="Accent" value={accent} onChange={setAccent} />
        </div>
        <Button magnetic disabled={busy}>
          {busy ? "Saving…" : "Save look"}
        </Button>
      </form>
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full cursor-pointer rounded-xl border border-border bg-bg"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl tabular-nums">{value}</p>
    </div>
  );
}

function OrdersTable({
  orders,
  onStatus,
  compact,
}: {
  orders: Awaited<ReturnType<typeof listOrders>>;
  onStatus: (id: string, status: OrderStatus) => Promise<void>;
  compact?: boolean;
}) {
  if (orders.length === 0) {
    return <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">No orders yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-soft text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            {!compact ? <th className="px-4 py-3 font-medium">Items</th> : null}
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="px-4 py-3">
                <strong>{o.id}</strong>
                <div className="text-xs text-subtle">{formatWhen(o.createdAt)}</div>
              </td>
              <td className="px-4 py-3">
                {o.customerName}
                <div className="text-xs text-muted">{o.customerPhone}</div>
              </td>
              {!compact ? (
                <td className="max-w-40 truncate px-4 py-3 text-xs">
                  {o.items.map((i) => `${i.name}×${i.qty}`).join(", ")}
                </td>
              ) : null}
              <td className="px-4 py-3 tabular-nums">{formatPrice(o.total)}</td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  className="h-9 rounded-lg border border-border bg-bg px-2 text-xs"
                  onChange={(e) => void onStatus(o.id, e.target.value as OrderStatus)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MenuPanel({ products, onChange }: { products: Product[]; onChange: () => void }) {
  const [editing, setEditing] = useState<Product | null | "new">(null);

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Menu</h1>
          <p className="text-sm text-muted">Add, edit, or hide dishes</p>
        </div>
        <Button magnetic onClick={() => setEditing("new")}>
          Add dish
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-3">
            <div className="size-16 overflow-hidden rounded-lg bg-soft">
              {p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted">
                {p.category} · {formatPrice(p.price)} · {p.available ? "On menu" : "Hidden"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={async () => {
                  if (!confirm("Remove this dish?")) return;
                  await deleteProduct({ data: { id: p.id } });
                  toast.success("Removed");
                  onChange();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <ProductForm
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      ) : null}
    </section>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState(product?.image ?? "");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await saveProduct({
        data: {
          id: product?.id,
          name: String(form.get("name") ?? ""),
          category: String(form.get("category") ?? "mains") as Category,
          description: String(form.get("description") ?? ""),
          price: Number(form.get("price")),
          image,
          available: form.get("available") === "on",
        },
      });
      toast.success("Saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay open fixed inset-0 z-50 grid place-items-center bg-fg/40 p-4">
      <form onSubmit={onSubmit} className="modal-panel w-full max-w-lg space-y-3 rounded-2xl bg-surface p-5">
        <h2 className="text-lg font-semibold">{product ? "Edit dish" : "Add dish"}</h2>
        <label className="block text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Category
            <select
              name="category"
              defaultValue={product?.category ?? "mains"}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Price (ZAR)
            <input
              name="price"
              type="number"
              min={1}
              required
              defaultValue={product?.price}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Image URL
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
            placeholder="https://…"
          />
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 900_000) {
              toast.error("Keep images under 900KB");
              return;
            }
            const reader = new FileReader();
            reader.onload = () => setImage(String(reader.result ?? ""));
            reader.readAsDataURL(file);
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="available" defaultChecked={product?.available ?? true} />
          Available on menu
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button magnetic disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
