import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-300 disabled:bg-indigo-500/40",
  secondary:
    "bg-slate-700 text-white hover:bg-slate-600 focus-visible:ring-slate-400 disabled:bg-slate-700/40",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/10 focus-visible:ring-slate-400",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-400 focus-visible:ring-emerald-300 disabled:bg-emerald-500/40",
  danger:
    "bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-300 disabled:bg-rose-500/40",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const variantClasses = VARIANT_CLASSES[variant];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold shadow-lg shadow-black/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
