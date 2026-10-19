"use client";
import { Check, MapPin as PinIcon } from "lucide-react";
import { Stamp } from "./art";

/** Plans and test prep progress: a trail with numbered checkpoints, not a bar. */
export function CheckpointTrail({ steps, done }: { steps: string[]; done: number }) {
  return (
    <ol className="relative">
      {steps.map((label, i) => {
        const complete = i < done;
        const current = i === done;
        return (
          <li key={label} className="relative flex gap-4 pb-7 last:pb-0">
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={`absolute left-[1.05rem] top-9 h-[calc(100%-2rem)] w-[4px] ${complete ? "bg-palm" : "trail-dots"}`}
              />
            ) : null}
            <span
              className={`z-10 grid h-[2.2rem] w-[2.2rem] shrink-0 place-items-center rounded-full border-2 border-ink font-bold ${
                complete ? "checkpoint-done bg-palm text-surface" : current ? "bg-marigold text-on-marigold" : "bg-surface"
              }`}
            >
              {complete ? <Check size={18} strokeWidth={3} aria-label="done" /> : i + 1}
            </span>
            <span className={`pt-1 ${complete ? "text-muted line-through decoration-2" : "font-bold"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** An opportunity as a ticket: category stamp, details, perforated footer. */
export function Ticket({
  category, title, org, details, why, footer, children,
}: { category: string; title: string; org: string; details: string[]; why?: string; footer?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <article className="ticket">
      <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
        <div className="min-w-0">
          <h3 className="text-xl">{title}</h3>
          <p className="text-muted">{org}</p>
        </div>
        <Stamp tone="teal" className="shrink-0">{category}</Stamp>
      </div>
      <ul className="space-y-1 px-6 pb-4">
        {details.map((d) => (
          <li key={d} className="flex items-center gap-2"><PinIcon size={15} strokeWidth={1.75} className="shrink-0 text-ruby" />{d}</li>
        ))}
      </ul>
      {children ? <div className="px-6 pb-4">{children}</div> : null}
      {why ? <p className="px-6 pb-4 font-bold">{why}</p> : null}
      {footer ? <div className="ticket-perf flex items-center justify-between gap-3 px-6 py-3">{footer}</div> : null}
    </article>
  );
}
