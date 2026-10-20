import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/format";
import { useCart } from "@/lib/cart";
import { placeOrder } from "@/lib/server/kitchen";
import type { Product } from "@/lib/types";

export function CheckoutModal({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
}) {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items
    .map((i) => {
      const p = byId.get(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const result = await placeOrder({
        data: {
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          email: String(form.get("email") ?? ""),
          notes: String(form.get("notes") ?? ""),
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        },
      });
      clear();
      onClose();
      toast.success(`Order ${result.id} received`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="overlay open fixed inset-0 z-[60] grid place-items-center bg-fg/40 p-4">
      <div className="modal-panel w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Complete order</h2>
          <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-soft" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 p-5">
          <Field name="name" label="Full name" required placeholder="Your name" />
          <Field name="phone" label="Phone" required placeholder="082 000 0000" />
          <Field name="email" label="Email (optional)" type="email" placeholder="you@email.com" />
          <label className="block text-sm font-medium">
            Notes
            <textarea
              name="notes"
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
              placeholder="Allergies, preferred time"
            />
          </label>
          <div className="rounded-xl bg-soft p-3 text-sm">
            {lines.map((l) => (
              <div key={l.productId} className="flex justify-between py-0.5">
                <span>
                  {l.product.name} × {l.qty}
                </span>
                <span className="tabular-nums">{formatPrice(l.product.price * l.qty)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
          </div>
          <Button magnetic className="w-full" size="lg" disabled={busy}>
            {busy ? "Sending…" : "Confirm order"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
      />
    </label>
  );
}
