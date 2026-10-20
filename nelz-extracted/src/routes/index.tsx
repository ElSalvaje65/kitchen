import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutModal } from "@/components/checkout-modal";
import { formatPrice } from "@/components/format";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { listMenu } from "@/lib/server/kitchen";
import type { Category, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { useBrand } from "@/components/brand";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const menu = useQuery({ queryKey: ["menu"], queryFn: () => listMenu() });
  const products = menu.data ?? [];
  const brand = useBrand();

  const filtered = products.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  function addItem(p: Product) {
    add(p.id);
    toast.success(`${p.name} added`);
  }

  return (
    <div className="min-h-dvh">
      <SiteHeader
        onOpenCart={() => setCartOpen(true)}
        query={query}
        onQuery={setQuery}
      />
      <section className="mx-auto max-w-3xl px-4 py-16 text-center stagger-in sm:py-24">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
          Locally sourced · Fresh daily
        </p>
        <h1 className="font-display mt-4 text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          Honest food,
          <br />
          made with care
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Seasonal plates from nearby farms, prepared simply and served with pride.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button magnetic size="lg" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>
            Explore menu
          </Button>
          <Button variant="secondary" size="lg" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
            Our kitchen
          </Button>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
        {menu.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-soft" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted">No dishes match that search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const inCart = items.some((i) => i.productId === p.id);
              return (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] bg-soft">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-subtle">Plate</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-medium tracking-wider text-subtle uppercase">
                      {p.category}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{p.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-semibold tabular-nums">{formatPrice(p.price)}</span>
                      <Button
                        magnetic
                        size="sm"
                        variant={inCart ? "secondary" : "primary"}
                        onClick={() => addItem(p)}
                      >
                        {inCart ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                        {inCart ? "Added" : "Add"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="about" className="border-y border-border bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Our kitchen</p>
            <h2 className="font-display mt-2 text-3xl">Rooted in local flavour</h2>
            <p className="mt-4 text-muted">
              {brand.shopName} works with small farms nearby. Menus shift with the harvest.
              No shortcuts — just honest cooking in small batches.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-primary" />
                Seasonal menus that change with the harvest
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-primary" />
                Transparent sourcing from local partners
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-primary" />
                Minimal waste, maximum flavour
              </li>
            </ul>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-bg p-8 text-center">
              <p className="font-display text-3xl">12+</p>
              <p className="text-sm text-muted">Local farms</p>
            </div>
            <div className="rounded-2xl border border-border bg-bg p-8 text-center">
              <p className="font-display text-3xl">Daily</p>
              <p className="text-sm text-muted">Fresh prep</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto flex max-w-6xl flex-wrap justify-between gap-8 px-4 py-16">
        <div>
          <h2 className="font-display text-3xl">Ready to order?</h2>
          <p className="mt-2 max-w-sm text-muted">
            Add plates to your cart and we will confirm by phone. Hours Tue–Sun, 11:00–21:00.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm text-muted">
          <p>
            <strong className="text-fg">Location</strong>
            <br />
            Cape Town & surrounds
          </p>
          <p>
            <strong className="text-fg">Contact</strong>
            <br />
            hello@nelzlocalmuch.co.za
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-subtle">
        <p>© {new Date().getFullYear()} {brand.shopName}. Fresh, local, honest.</p>
        <p className="mt-2">
          <a href="/guide" className="underline">
            User guide
          </a>
        </p>
        <a
          href="/nelz-local-much.zip"
          download="nelz-local-much.zip"
          className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground"
        >
          Download the project zip
        </a>
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        products={products}
        onCheckout={() => {
          setCartOpen(false);
          setCheckout(true);
        }}
      />
      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} products={products} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-sm capitalize transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
