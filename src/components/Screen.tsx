import type { ReactNode } from "react";

interface ScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Screen({ title, subtitle, children, footer }: ScreenProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-base text-slate-300 sm:text-lg">{subtitle}</p>
        ) : null}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      {footer ? (
        <footer className="mt-8 text-center text-sm text-slate-400">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
