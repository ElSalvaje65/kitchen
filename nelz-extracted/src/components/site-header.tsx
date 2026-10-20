import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart";
import { BrandMark, useBrand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export function SiteHeader({
  onOpenCart,
  query,
  onQuery,
}: {
  onOpenCart: () => void;
  query: string;
  onQuery: (v: string) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const { user, isPending } = useCurrentUserState();
  const brand = useBrand();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2.5 font-medium">
          <BrandMark name={brand.shopName} logo={brand.logo} />
          <span className="hidden sm:inline">{brand.shopName}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#menu" className="hover:text-fg">
            Menu
          </a>
          <a href="#about" className="hover:text-fg">
            Kitchen
          </a>
          <Link to="/guide" className="hover:text-fg">
            Guide
          </Link>
          <a href="#contact" className="hover:text-fg">
            Visit
          </a>
        </nav>
        <div className="flex items-center gap-1">
          <a
            href="/Nelz-Local-Much-Run-Guide.pdf"
            download="Nelz-Local-Much-Run-Guide.pdf"
            className="mr-1 hidden h-9 items-center rounded-full border border-border px-3 text-xs font-medium text-fg sm:inline-flex"
          >
            Setup PDF
          </a>
          <a
            href="/nelz-local-much.zip"
            download="nelz-local-much.zip"
            className="mr-1 inline-flex h-9 items-center rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground"
          >
            Download zip
          </a>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="size-11"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            className="relative size-11"
            onClick={onOpenCart}
          >
            <ShoppingBag className="size-4" />
            {count > 0 ? (
              <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Button>
          {isPending ? (
            <div className="ml-1 size-8 animate-pulse rounded-full bg-soft" />
          ) : user ? (
            <SignedIn>
              <div className="ml-1 flex items-center gap-2">
                <Link
                  to="/admin"
                  className="hidden rounded-lg px-2 py-1 text-xs text-subtle hover:bg-soft hover:text-fg sm:inline"
                >
                  Kitchen
                </Link>
                <UserButton />
              </div>
            </SignedIn>
          ) : (
            <SignedOut>
              <Link
                to="/login"
                search={{ next: "/admin" }}
                className="ml-1 rounded-lg px-3 py-2 text-sm text-muted hover:bg-soft hover:text-fg"
              >
                Staff
              </Link>
            </SignedOut>
          )}
        </div>
      </div>
      {searchOpen ? (
        <div className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
            <Search className="size-4 text-subtle" />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search dishes..."
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false);
                onQuery("");
              }}
              className="grid size-10 place-items-center rounded-full hover:bg-soft"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
