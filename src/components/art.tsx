// Small custom illustrations in the trail-map theme. All colors come from tokens,
// so they follow light and night mode automatically.

export function Compass({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 3v3M16 26v3M3 16h3M26 16h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M20.5 11.5 18 18l-6.5 2.5L14 14z" className="fill-ruby stroke-ruby" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.4" className="fill-surface" />
    </svg>
  );
}

export function MapPin({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30" className={className} aria-hidden="true">
      <path d="M12 29C12 29 3 18.5 3 11.5a9 9 0 0 1 18 0C21 18.5 12 29 12 29z" className="fill-ruby" />
      <circle cx="12" cy="11.5" r="3.6" className="fill-surface" />
    </svg>
  );
}

/** Winding dotted trail with checkpoints, used on the welcome screen. */
export function TrailHero({ className = "" }: { className?: string }) {
  const stops = [
    [58, 244],
    [196, 150],
    [338, 214],
    [470, 96],
  ] as const;
  return (
    <svg viewBox="0 0 560 300" className={className} role="img" aria-label="">
      <path
        d="M58 244 C 110 236, 130 150, 196 150 S 280 224, 338 214 S 430 110, 470 96"
        fill="none"
        className="stroke-ink"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 11"
      />
      {stops.slice(0, 3).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="15" className="fill-surface stroke-ink" strokeWidth="2.25" />
          <text x={x} y={y + 5} textAnchor="middle" className="fill-ink" style={{ font: "700 15px var(--font-body-stack)" }}>
            {i + 1}
          </text>
        </g>
      ))}
      <g transform="translate(450 54)">
        <path d="M20 54C20 54 2 33 2 20a18 18 0 0 1 36 0c0 13-18 34-18 34z" className="fill-ruby" />
        <circle cx="20" cy="20" r="7" className="fill-surface" />
      </g>
    </svg>
  );
}

/** Embroidered park patch: scalloped edge, stitched ring, icon slot. */
export function Patch({
  label,
  children,
  earned = true,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  earned?: boolean;
  className?: string;
}) {
  const scallops = 18;
  const pts = Array.from({ length: scallops * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 54 : 50;
    const a = (i / (scallops * 2)) * Math.PI * 2;
    return `${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <figure className={`inline-flex w-28 flex-col items-center text-center ${className}`}>
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 120 120" className={`absolute inset-0 ${earned ? "" : "opacity-45 grayscale"}`} aria-hidden="true">
          <polygon points={pts} className="fill-teal stroke-ink" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="60" cy="60" r="40" fill="none" className={`stroke-marigold patch-stitch ${earned ? "stitch-in" : ""}`} strokeWidth="2.5" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-on-teal">{children}</div>
      </div>
      <figcaption className="mt-1 text-sm font-bold leading-tight">{label}</figcaption>
    </figure>
  );
}

/** Rubber-stamp label. Used for ticket categories and "saved" feedback. */
export function Stamp({
  children,
  tone = "ruby",
  animate = false,
  className = "",
}: {
  children: React.ReactNode;
  tone?: "ruby" | "teal" | "terracotta";
  animate?: boolean;
  className?: string;
}) {
  const color = { ruby: "text-ruby border-ruby", teal: "text-teal border-teal", terracotta: "text-terracotta border-terracotta" }[tone];
  return (
    <span
      className={`inline-block -rotate-6 rounded-[3px] border-2 border-double px-2 py-0.5 text-sm font-bold ${color} ${animate ? "stamp-in" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

/** Empty-state drawing: a quiet fork in the trail with a signpost. */
export function EmptyTrail({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden="true" fill="none">
      <path d="M110 134 C 108 108, 96 96, 62 80" className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 9" />
      <path d="M110 134 C 112 106, 128 92, 164 74" className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 9" />
      <path d="M110 134 C 110 120, 110 112, 110 100" className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 9" />
      <rect x="107" y="30" width="6" height="72" rx="2" className="fill-terracotta" />
      <path d="M113 36h50l10 10-10 10h-50z" className="fill-surface stroke-ink" strokeWidth="2" strokeLinejoin="round" />
      <path d="M107 62H62L52 72l10 10h45z" className="fill-surface stroke-ink" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="110" cy="28" r="5" className="fill-ruby" />
    </svg>
  );
}
