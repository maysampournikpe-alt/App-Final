"use client";
import { useState } from "react";
import { useCopy } from "@/lib/use-copy";
import { examCopy } from "./copy";
import { inputClass } from "../ui";

/** A plain scientific calculator for practice. The real digital SAT has the Desmos graphing calculator built in. */
export function Calculator() {
  const c = useCopy(examCopy);
  const [expr, setExpr] = useState("");
  const [rows, setRows] = useState<{ e: string; r: string }[]>([]);
  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expr.trim()) return;
    let r: string;
    try {
      const { evaluate, format } = await import("mathjs"); // loaded only when someone uses it
      const v = evaluate(expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-"));
      r = typeof v === "number" || typeof v === "object" ? format(v, { precision: 10 }) : String(v);
    } catch {
      r = "?";
    }
    setRows((x) => [{ e: expr, r }, ...x].slice(0, 5));
    setExpr("");
  };
  return (
    <details className="guide-card p-3">
      <summary className="cursor-pointer font-bold">{c.calculator}</summary>
      <form onSubmit={run} className="mt-3">
        <label><span className="sr-only">{c.calcHelp}</span>
          <input value={expr} onChange={(e) => setExpr(e.target.value)} placeholder={c.calcPh} inputMode="text" autoComplete="off" className={`${inputClass} font-mono`} /></label>
        <p className="mt-1 text-sm text-muted">{c.calcHelp}</p>
      </form>
      {rows.length ? <ul className="mt-2 space-y-1 font-mono">{rows.map((x, i) => <li key={i} className="flex justify-between gap-3"><span className="truncate text-muted">{x.e}</span><b>= {x.r}</b></li>)}</ul> : null}
    </details>
  );
}
