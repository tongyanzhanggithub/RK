import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-safety text-ink hover:bg-amber-400",
  outline: "border border-navy text-navy hover:bg-panel",
  ghost: "text-navy hover:bg-panel"
};

const base = "inline-flex min-h-[2.75rem] items-center justify-center gap-2 px-4 py-2 text-center font-black leading-tight transition-colors";

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode; variant?: ButtonVariant }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
