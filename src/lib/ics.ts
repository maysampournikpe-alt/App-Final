import { addDays, type ISODate } from "./dates";

export interface IcsEvent { uid: string; date: ISODate; title: string; description?: string }

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** Long lines are folded at 75 characters, as the calendar standard (RFC 5545) requires. */
const fold = (line: string) => { const out: string[] = []; let rest = line; while (rest.length > 75) { out.push(rest.slice(0, 75)); rest = " " + rest.slice(75); } out.push(rest); return out.join("\r\n"); };
const compact = (d: ISODate) => d.replace(/-/g, "");
const stamp = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}Z`;

/** A calendar file (.ics) of all-day events that Google Calendar, Apple Calendar and Outlook can import. */
export function buildICS(events: IcsEvent[], opts: { name?: string; now?: Date } = {}): string {
  const now = stamp(opts.now ?? new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rumbo//Deadlines//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(opts.name ?? "Rumbo")}`];
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@rumbo.app`, `DTSTAMP:${now}`, `DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${compact(addDays(e.date, 1))}`, `SUMMARY:${esc(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
