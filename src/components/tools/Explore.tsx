"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { COURSES, SEASONS } from "@/data/explore";
import { quoteOfDay, todayNumber } from "@/lib/quote";
import { INTEREST_TAGS, type Tag } from "@/data/guides";
import { useLang } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { useCopy } from "@/lib/use-copy";
import { Callout, Chips, Empty, Ext, FindLink, Head, pick, spotifySearch, youtubeSearch } from "./shared";

const copy = {
  en: {
    sTitle: "Seasonal suggestions", sLead: "What to look for right now, based on the time of year.", month: "This month", other: "Look ahead", find: "Search the Finder", months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    qTitle: "Quote of the day", qLead: "A short saying to start your day. It changes every day.", another: "Show another", today: "Today's saying",
    cTitle: "Skill courses", cLead: "Free courses and tools that match your goals.", forYou: "Matched to your interests", all: "All free courses", none: "Add interests in your profile to see matches, or look at all the courses.", free: "Free to use", visit: "Open", tags: { stem: "Science and math", health: "Health", arts: "Arts", business: "Business", law: "Law and government", trades: "Trades", service: "Helping others", teaching: "Teaching", outdoors: "Outdoors", language: "Languages and writing", sports: "Sports", tech: "Technology" } as Record<Tag, string>,
    cNote: "These sites can change their offers. Always check that something is free before you sign up, and never share your passwords.", profile: "Update my interests",
    pTitle: "Study playlists", pLead: "Music can help you focus. Pick a style and open it on the site you like.", yt: "YouTube", sp: "Spotify", tip: "Tip: music with no words is usually easier to study with. If a song makes you want to sing along, switch it.",
    styles: [["Lo-fi beats", "lofi study beats"], ["Classical and piano", "classical piano for studying"], ["Nature and rain sounds", "rain sounds for studying"], ["Video game music", "video game music for studying"], ["Cinematic and orchestral", "epic orchestral focus music"], ["Jazz and chill", "jazz for studying"], ["Spanish guitar", "spanish guitar instrumental study"], ["White and brown noise", "brown noise for focus"]] as [string, string][],
  },
  es: {
    sTitle: "Sugerencias de temporada", sLead: "Qué buscar ahora, según la época del año.", month: "Este mes", other: "Mira adelante", find: "Buscar en el Buscador", months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    qTitle: "Frase del día", qLead: "Una frase corta para empezar tu día. Cambia todos los días.", another: "Mostrar otra", today: "La frase de hoy",
    cTitle: "Cursos de habilidades", cLead: "Cursos y herramientas gratis que van con tus metas.", forYou: "Según tus intereses", all: "Todos los cursos gratis", none: "Agrega intereses en tu perfil para ver recomendaciones, o mira todos los cursos.", free: "Gratis", visit: "Abrir", tags: { stem: "Ciencias y matemáticas", health: "Salud", arts: "Artes", business: "Negocios", law: "Derecho y gobierno", trades: "Oficios", service: "Ayudar a otros", teaching: "Enseñanza", outdoors: "Aire libre", language: "Idiomas y escritura", sports: "Deportes", tech: "Tecnología" } as Record<Tag, string>,
    cNote: "Estos sitios pueden cambiar sus ofertas. Revisa siempre que algo sea gratis antes de inscribirte, y nunca compartas tus contraseñas.", profile: "Actualizar mis intereses",
    pTitle: "Música para estudiar", pLead: "La música puede ayudarte a concentrarte. Elige un estilo y ábrelo en el sitio que prefieras.", yt: "YouTube", sp: "Spotify", tip: "Consejo: la música sin letra suele ser más fácil para estudiar. Si una canción te da ganas de cantar, cámbiala.",
    styles: [["Ritmos lo-fi", "lofi study beats"], ["Clásica y piano", "música clásica piano para estudiar"], ["Sonidos de naturaleza y lluvia", "sonido de lluvia para estudiar"], ["Música de videojuegos", "música de videojuegos para estudiar"], ["Cinematográfica y orquestal", "música orquestal para concentrarse"], ["Jazz tranquilo", "jazz para estudiar"], ["Guitarra española", "guitarra española instrumental para estudiar"], ["Ruido blanco y marrón", "ruido marrón para concentrarse"]] as [string, string][],
  },
};

export function SeasonalTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const now = new Date().getMonth();
  const [shown, setShown] = useState(now);
  return (
    <Head title={c.sTitle} lead={c.sLead}>
      <div className="mt-5"><Chips<string> value={String(shown)} onChange={(v) => setShown(Number(v))} label={c.sTitle} options={c.months.map((m, i) => ({ id: String(i), label: i === now ? `${m} (${c.month.toLowerCase()})` : m }))} /></div>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">{SEASONS[shown].items.map((it) => (
        <li key={it.q} className="guide-card p-4"><h2 className="text-xl">{pick(it.title, lang)}</h2><p className="mt-2 text-muted">{pick(it.why, lang)}</p><p className="mt-3"><FindLink q={it.q}>{c.find}</FindLink></p></li>))}</ul>
    </Head>
  );
}

export function QuoteTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [offset, setOffset] = useState(0);
  const q = quoteOfDay(todayNumber() + offset);
  return (
    <Head title={c.qTitle} lead={c.qLead}>
      <figure className="guide-card mt-6 p-8 text-center"><blockquote className="font-display text-3xl font-semibold sm:text-4xl">“{pick(q.text, lang)}”</blockquote><figcaption className="mt-4 text-muted">{pick(q.by, lang)}</figcaption>
        <p className="mt-3 text-sm text-muted">{offset === 0 ? c.today : ""}</p></figure>
      <button onClick={() => setOffset((o) => o + 1)} className="mt-4 font-bold text-teal underline underline-offset-4">{c.another}</button>
    </Head>
  );
}

export function CoursesTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const mine = useMemo(() => new Set<Tag>(profile.interests.flatMap((i) => INTEREST_TAGS[i] ?? [])), [profile.interests]);
  const [mode, setMode] = useState<"you" | "all">(mine.size ? "you" : "all");
  const list = COURSES.filter((x) => mode === "all" || x.tags.some((t) => mine.has(t)));
  return (
    <Head title={c.cTitle} lead={c.cLead} wide>
      <div className="mt-5"><Chips value={mode} onChange={setMode} label={c.cTitle} options={[{ id: "you", label: c.forYou }, { id: "all", label: c.all }]} /></div>
      {mode === "you" && !mine.size ? <Empty><p>{c.none}</p><p className="mt-2"><Link href="/t/profile/interests" className="font-bold text-teal underline underline-offset-4">{c.profile}</Link></p></Empty> : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">{list.map((x) => (
          <li key={x.id} className="guide-card p-4"><h2 className="text-xl">{x.name}</h2><p className="mt-1">{pick(x.what, lang)}</p><p className="mt-1 text-sm text-muted">{x.tags.map((t) => c.tags[t]).join(" · ")}</p><p className="mt-2"><Ext href={x.url}>{c.visit} {x.name}</Ext></p></li>))}</ul>
      )}
      <Callout>{c.cNote}</Callout>
    </Head>
  );
}

export function PlaylistTool() {
  const c = useCopy(copy);
  return (
    <Head title={c.pTitle} lead={c.pLead}>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">{c.styles.map(([label, q]) => <li key={q} className="guide-card flex items-center justify-between gap-3 p-4"><span className="font-bold">{label}</span><span className="flex gap-4 text-sm"><Ext href={youtubeSearch(q)}>{c.yt}</Ext><Ext href={spotifySearch(q)}>{c.sp}</Ext></span></li>)}</ul>
      <Callout>{c.tip}</Callout>
    </Head>
  );
}
