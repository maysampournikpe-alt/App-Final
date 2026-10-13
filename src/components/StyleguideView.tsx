"use client";
import { useState } from "react";
import { Award, BookOpen, Compass as CompassIcon, Flame, Heart } from "lucide-react";
import { ICONS } from "@/config/icons";
import { Compass, EmptyTrail, MapPin, Patch, Stamp, TrailHero } from "./art";
import { CheckpointTrail, Ticket } from "./cards";
import { Page, SoonBadge } from "./ui";

const swatches = [
  ["paper", "Sand / night trail", "bg-paper"], ["surface", "Field-guide page", "bg-surface"], ["sunken", "Well", "bg-sunken"],
  ["ink", "Ink", "bg-ink"], ["ruby", "Ruby red (accent)", "bg-ruby"], ["teal", "Resaca teal", "bg-teal"],
  ["marigold", "Marigold", "bg-marigold"], ["terracotta", "Sunset terracotta", "bg-terracotta"], ["palm", "Palm green", "bg-palm"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-[1.5px] border-ink py-8">
      <h2 className="mb-5 text-2xl sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

export function StyleguideView() {
  const [done, setDone] = useState(2);
  const [stamped, setStamped] = useState(false);
  return (
    <Page wide>
      <h1 className="text-4xl sm:text-5xl">Style guide</h1>
      <p className="mt-2 text-muted">Everything in the app is built from what is on this page. If a screen needs something that is not here, it gets added here first.</p>

      <Section title="Color">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map(([name, label, cls]) => (
            <div key={name} className="overflow-hidden rounded-md border-[1.5px] border-ink">
              <div className={`h-16 ${cls}`} />
              <div className="bg-surface p-2 text-sm"><b>{name}</b><br />{label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <p className="font-display text-5xl font-semibold">Fraunces for headings</p>
        <p className="mt-3 max-w-prose text-lg">Atkinson Hyperlegible for everything you read. It was drawn so similar letters, like I, l and 1, are easy to tell apart. Dyslexia-friendly mode swaps every word to OpenDyslexic.</p>
        <div className="mt-4 space-y-1">
          <h1 className="text-4xl">Heading 1, four rem</h1><h2 className="text-3xl">Heading 2</h2>
          <h3 className="text-2xl">Heading 3</h3><h4 className="text-xl">Heading 4</h4><p className="text-sm text-muted">Small helper text.</p>
        </div>
      </Section>

      <Section title="Buttons and fields">
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-md border-[1.5px] border-ink bg-ruby px-5 py-2.5 font-bold text-on-ruby shadow-[3px_3px_0_var(--c-ink)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--c-ink)]">Save it</button>
          <button className="rounded-md border-[1.5px] border-ink bg-teal px-5 py-2.5 font-bold text-on-teal">Start plan</button>
          <button className="rounded-md border-[1.5px] border-ink px-5 py-2.5 font-bold hover:bg-sunken">Not now</button>
          <button disabled className="cursor-not-allowed rounded-md border-[1.5px] border-line px-5 py-2.5 font-bold text-muted">Disabled</button>
          <SoonBadge />
        </div>
        <label className="mt-5 block max-w-md">
          <span className="font-bold">Your nickname</span>
          <input className="mt-1 w-full rounded-md border-[1.5px] border-ink bg-surface px-3 py-2.5" placeholder="maria_r" />
          <span className="text-sm text-muted">Not your real name. Pick something only you would pick.</span>
        </label>
      </Section>

      <Section title="Icons">
        <p className="mb-3 text-muted">One family, one stroke weight.</p>
        <div className="grid grid-cols-6 gap-3 sm:grid-cols-10 lg:grid-cols-14">
          {Object.entries(ICONS).map(([name, Icon]) => (
            <div key={name} title={name} className="grid h-11 place-items-center rounded-md border border-line bg-surface"><Icon size={22} strokeWidth={1.75} /></div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-6 text-teal"><Compass size={44} /><MapPin size={40} /></div>
      </Section>

      <Section title="Ticket: opportunities">
        <div className="grid gap-6 md:grid-cols-2">
          <Ticket
            category="Competition" title="UIL Chess Puzzle, Region 4" org="UIL / Texas Education Agency"
            details={["Free", "Grades 6–8", "Edinburg, TX · 14 miles"]} why="Because you like chess and want a first tournament."
            footer={<><span className="text-sm text-muted">Deadline Nov 14</span><button onClick={() => setStamped(true)} className="font-bold text-teal underline underline-offset-4">Save</button>{stamped ? <Stamp animate tone="ruby">Saved</Stamp> : null}</>}
          />
          <Ticket
            category="Not confirmed" title="Hidalgo County legal aid office" org="Ask about a student internship"
            details={["Phone script ready", "Not a listing. Contact first."]}
          />
        </div>
      </Section>

      <Section title="Notebook page: notes and journals">
        <div className="notebook max-w-xl py-4 pr-5 leading-[1.9rem]">
          <p className="font-display text-xl font-semibold">Cell respiration</p>
          <p>Glucose goes in, ATP comes out.</p>
          <p>Mitochondria: where most of it happens.</p>
        </div>
      </Section>

      <Section title="Checkpoint trail: plans and test prep">
        <div className="max-w-md">
          <CheckpointTrail steps={["Pick a tournament", "Learn two openings", "Play 10 practice games", "Register by Nov 14", "Compete"]} done={done} />
          <div className="mt-5 flex gap-2">
            <button onClick={() => setDone((d) => Math.min(5, d + 1))} className="rounded-md border-[1.5px] border-ink px-3 py-1.5 font-bold hover:bg-sunken">Complete a step</button>
            <button onClick={() => setDone(0)} className="rounded-md border-[1.5px] border-ink px-3 py-1.5 font-bold hover:bg-sunken">Reset</button>
          </div>
        </div>
      </Section>

      <Section title="Patches: badges">
        <div className="flex flex-wrap gap-6">
          <Patch label="First save"><Heart size={34} strokeWidth={1.75} /></Patch>
          <Patch label="7-day streak"><Flame size={34} strokeWidth={1.75} /></Patch>
          <Patch label="10 hours served"><Award size={34} strokeWidth={1.75} /></Patch>
          <Patch label="Read 5 books" earned={false}><BookOpen size={34} strokeWidth={1.75} /></Patch>
          <Patch label="Explorer" earned={false}><CompassIcon size={34} strokeWidth={1.75} /></Patch>
        </div>
      </Section>

      <Section title="Empty state and illustration">
        <div className="guide-card flex max-w-xl items-center gap-5 p-5">
          <EmptyTrail className="h-24 w-36 shrink-0 text-ink" />
          <p className="text-lg">Nothing saved yet. Find something you would actually want to do this month.</p>
        </div>
        <TrailHero className="mt-6 max-w-md text-ink" />
      </Section>

      <Section title="Contour texture">
        <div className="contours guide-card grid h-40 place-items-center"><p className="font-display text-2xl">Topographic lines, off in low data mode</p></div>
      </Section>
    </Page>
  );
}
