"use client";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Fragment } from "react";

/**
 * Shows question text with LaTeX between dollar signs. A literal dollar sign is written \$.
 * Only the math is turned into HTML (by KaTeX, which escapes its input); all other text stays plain text.
 */
function render(math: string): string {
  try {
    return katex.renderToString(math, { throwOnError: false, output: "htmlAndMathml", strict: "ignore", trust: false });
  } catch {
    return "";
  }
}

export function MathText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n{2,}/).map((para, pi) => (
        <p key={pi} className="my-2 first:mt-0 last:mb-0">
          {para.split("\n").map((line, li) => (
            <Fragment key={li}>
              {li > 0 ? <br /> : null}
              {parse(line)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

function parse(line: string) {
  const out: React.ReactNode[] = [];
  let buf = "", i = 0, n = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "$") { buf += "$"; i += 2; continue; }
    if (ch === "$") {
      let j = i + 1;
      while (j < line.length && !(line[j] === "$" && line[j - 1] !== "\\")) j++;
      if (j < line.length) {
        if (buf) { out.push(buf); buf = ""; }
        const html = render(line.slice(i + 1, j));
        out.push(<span key={`m${n++}`} dangerouslySetInnerHTML={{ __html: html }} />);
        i = j + 1;
        continue;
      }
    }
    buf += ch; i++;
  }
  if (buf) out.push(buf);
  return out.map((node, k) => <Fragment key={k}>{node}</Fragment>);
}
