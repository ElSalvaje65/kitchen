import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/format";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function CartDrawer({
  open,
  onClose,
  products,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onCheckout: () => void;
}) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items
    .map((i) => {
      const p = byId.get(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  return (
    <>
      <div
        className={`overlay fixed inset-0 z-50 bg-fg/35 ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-xl ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Your order</h2>
          <Button variant="ghost" size="icon" className="size-10" onClick={onClose} aria-label="Close cart">
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {lines.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">Your cart is empty.</p>
          ) : (
            lines.map((line) => (
              <div key={line.productId} className="flex gap-3 border-b border-border py-4">
                <div className="size-16 overflow-hidden rounded-lg bg-soft">
                  {line.product.image ? (
                    <img src={line.product.image} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{line.product.name}</p>
                  <p className="text-sm text-muted">{formatPrice(line.product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-lg border border-border"
                      onClick={() => setQty(line.productId, line.qty - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.qty}</span>
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-lg border border-border"
                      onClick={() => setQty(line.productId, line.qty + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-xs text-subtle hover:text-danger"
                      onClick={() => remove(line.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {lines.length > 0 ? (
          <div className="border-t border-border p-5">
            <div className="mb-3 flex justify-between text-base">
              <span>Total</span>
              <strong className="tabular-nums">{formatPrice(total)}</strong>
            </div>
            <Button magnetic className="w-full" size="lg" onClick={onCheckout}>
              Place order
            </Button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
