import { cva, type VariantProps } from "class-variance-authority";
import {
  type ButtonHTMLAttributes,
  type PointerEvent,
  type ReactNode,
  useRef,
} from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "btn-press relative inline-flex items-center justify-center gap-2 overflow-hidden font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border border-border bg-surface text-fg hover:bg-soft",
        ghost: "text-fg hover:bg-soft",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-sm",
        md: "h-11 rounded-xl px-4 text-sm",
        lg: "h-12 rounded-xl px-5 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    magnetic?: boolean;
    children?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  magnetic,
  onPointerMove,
  onPointerLeave,
  children,
  ...props
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleMove(e: PointerEvent<HTMLButtonElement>) {
    onPointerMove?.(e);
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    ref.current.style.setProperty("--mx", `${x}%`);
    ref.current.style.setProperty("--my", `${y}%`);
    const dx = (e.clientX - (r.left + r.width / 2)) / 12;
    const dy = (e.clientY - (r.top + r.height / 2)) / 14;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function handleLeave(e: PointerEvent<HTMLButtonElement>) {
    onPointerLeave?.(e);
    if (!ref.current) return;
    ref.current.style.transform = "";
  }

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), magnetic && "btn-shine", className)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {children}
    </button>
  );
}

export { buttonVariants };
