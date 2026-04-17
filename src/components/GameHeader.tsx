import { Button } from "./Button";

interface GameHeaderProps {
  modeLabel: string;
  correct: number;
  attempts: number;
  onExit: () => void;
}

export function GameHeader({
  modeLabel,
  correct,
  attempts,
  onExit,
}: GameHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400">Tryb</p>
        <p className="text-lg font-semibold text-white">{modeLabel}</p>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-wider text-slate-400">Wynik</p>
        <p className="text-lg font-semibold text-white">
          {correct} / {attempts}
        </p>
      </div>
      <Button variant="ghost" onClick={onExit}>
        ← Wyjdź
      </Button>
    </div>
  );
}
