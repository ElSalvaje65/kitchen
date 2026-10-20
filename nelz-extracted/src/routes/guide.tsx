import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandMark, useBrand } from "@/components/brand";

export const Route = createFileRoute("/guide")({ component: GuidePage });

function GuidePage() {
  const brand = useBrand();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <BrandMark name={brand.shopName} logo={brand.logo} />
            <span>{brand.shopName}</span>
          </Link>
          <Link to="/" className="text-sm text-muted hover:text-fg">
            Menu
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">User guide</p>
        <h1 className="font-display mt-3 text-4xl tracking-tight">{brand.shopName}</h1>
        <p className="mt-3 text-muted">
          A short guide for customers and for the two people who run the kitchen.
        </p>

        <Section title="Order food">
          <Step n="1" title="Open the menu">
            The home page lists what is available today. Use the category chips, or the search icon, to find a dish.
          </Step>
          <Step n="2" title="Add it to the bag">
            Tap the add button on a dish. A small number appears on the bag icon.
          </Step>
          <Step n="3" title="Check the bag">
            Tap the bag. Change quantities or remove a dish before you pay.
          </Step>
          <Step n="4" title="Place the order">
            Tap checkout and enter your name and phone. Email and notes are optional. Use notes for allergies or a pickup time.
          </Step>
          <Step n="5" title="Wait for confirmation">
            You will see a message that the order was received. The kitchen can then mark it confirmed, completed, or cancelled.
          </Step>
        </Section>

        <Section title="You do not need an account to order">
          <p className="text-sm leading-relaxed text-muted">
            Anyone can browse and order. Sign-in is only for staff. Customers never see the kitchen.
          </p>
        </Section>

        <Section title="Staff sign-in">
          <Step n="1" title="Tap Staff">
            It sits in the top bar. That opens a separate sign-in page.
          </Step>
          <Step n="2" title="Create an account">
            Switch to create account, then enter a name, email, and password. Next time, use sign in with the same email and password.
          </Step>
          <Step n="3" title="Open Kitchen">
            After you sign in, open Kitchen. The first two accounts that do this become the only two managers. A third account is told the kitchen is full.
          </Step>
          <Step n="4" title="Sign out">
            Use Sign out next to your name when you are done. Signing out does not delete the account.
          </Step>
        </Section>

        <Section title="What staff can do">
          <Item name="Overview">See how many orders are in, the total, and the newest orders.</Item>
          <Item name="Menu">Add a dish, change its name, description, price, category, and picture, or remove it. Mark a dish unavailable to hide it from customers.</Item>
          <Item name="Orders">Move an order from pending to confirmed, completed, or cancelled.</Item>
          <Item name="Look">Change the shop name, upload a logo, and pick the text colour, background colour, and the small accent colour. The public site updates straight away.</Item>
          <Item name="Activity">Read a short log of menu, order, and look changes.</Item>
        </Section>

        <p className="mt-10 text-sm text-muted">
          <a className="underline" href="/Nelz-Local-Much-User-Guide.pdf" download>
            Download this guide (PDF)
          </a>
          <span className="mx-2 text-subtle">·</span>
          <Link to="/" className="underline">
            Back to the menu
          </Link>
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {n}
      </span>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}

function Item({ name, children }: { name: string; children: string }) {
  return (
    <p className="text-sm leading-relaxed text-muted">
      <strong className="text-fg">{name}. </strong>
      {children}
    </p>
  );
}
