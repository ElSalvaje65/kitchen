import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DEFAULT_BRAND, getBrand } from "@/lib/server/kitchen";

export function useBrand() {
  const query = useQuery({
    queryKey: ["brand"],
    queryFn: () => getBrand(),
    staleTime: 15_000,
  });
  return query.data ?? DEFAULT_BRAND;
}

export function BrandSync() {
  const brand = useBrand();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-bg", brand.paper);
    root.style.setProperty("--color-primary", brand.ink);
    root.style.setProperty("--color-ring", brand.ink);
    root.style.setProperty("--color-accent", brand.accent);
    root.style.setProperty("--color-danger", brand.accent);
    document.title = brand.shopName;
  }, [brand]);
  return null;
}

export function BrandMark({ name, logo }: { name: string; logo: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        className="size-8 rounded-lg object-cover ring-2 ring-accent"
      />
    );
  }
  return (
    <span className="relative grid size-8 place-items-center rounded-lg bg-primary font-display text-sm text-primary-foreground">
      {name.trim().charAt(0).toUpperCase() || "N"}
      <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-accent" />
    </span>
  );
}
