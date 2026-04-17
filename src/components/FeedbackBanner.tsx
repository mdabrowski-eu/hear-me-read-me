export type FeedbackStatus = "idle" | "correct" | "incorrect" | "info";

interface FeedbackBannerProps {
  status: FeedbackStatus;
  message: string;
}

const STATUS_CLASSES: Record<FeedbackStatus, string> = {
  idle: "border-white/10 bg-slate-900/40 text-slate-300",
  correct: "border-emerald-500/60 bg-emerald-500/15 text-emerald-100",
  incorrect: "border-rose-500/60 bg-rose-500/15 text-rose-100",
  info: "border-sky-500/60 bg-sky-500/15 text-sky-100",
};

export function FeedbackBanner({ status, message }: FeedbackBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition ${STATUS_CLASSES[status]}`}
    >
      {message || "\u00A0"}
    </div>
  );
}
