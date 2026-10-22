"use client";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { inputClass } from "../ui";
import { Callout, Ext, Head, webSearch } from "./shared";

const copy = {
  en: {
    mTitle: "Local resource map", mLead: "Open a map search for places that help students, close to you.", place: "City or ZIP code", placePh: "Edinburg, TX", save: "Searching near", open: "Open map", none: "Add a city or ZIP code above for better results.", also: "Also try",
    call: "Need help finding something? Call 211 Texas. It is free and connects people to local services.", site: "Open 211 Texas",
    bTitle: "Bus route helper", bLead: "How the bus works in the Rio Grande Valley, and where to find official routes and schedules.", from: "From", to: "To", fromPh: "My address or school", toPh: "UTRGV Edinburg", plan: "Open trip plan in Google Maps", planNote: "Opens in a new tab with bus directions.", needBoth: "Fill in both places.",
    about: "About Valley Metro", points: ["Valley Metro runs buses between many Valley cities, like Edinburg, McAllen, Mission and more. The Lower Rio Grande Valley Development Council shares the route maps and schedules.", "Some routes connect to the UTRGV Edinburg campus and McAllen Central Station.", "Metro McAllen is run by the City of McAllen and covers trips inside the city.", "There is no bus service on major holidays. Check the schedule for your route before you go.", "Valley Metro also offers curbside pick-up for people who call at least a day ahead, if the trip is close to a route. Call 1-800-574-8322 to ask."],
    vm: "Valley Metro schedules and maps", tip: "Tip: leave 10 extra minutes and have a backup plan for rides home after evening events.", check: "Routes and times change. Always check the official schedule.",
    eTitle: "Local events", eLead: "Find city, library and university events for students. These links search for what is on right now.", nearYou: "Events near", find: "Search for events", ideas: [["Teen events and programs", "teen events"], ["Library events for kids and teens", "library events teens"], ["College open houses and campus tours", "college campus tour open house"], ["Job and career fairs", "career fair students"], ["Free workshops and classes", "free workshops for students"], ["Volunteer days", "volunteer day"]] as [string, string][], eNote: "Check the date, cost and age rules before you go, and tell a parent or guardian where you will be.",
  },
  es: {
    mTitle: "Mapa de recursos locales", mLead: "Abre una búsqueda en el mapa de lugares que ayudan a los estudiantes, cerca de ti.", place: "Ciudad o código postal", placePh: "Edinburg, TX", save: "Buscando cerca de", open: "Abrir mapa", none: "Agrega una ciudad o código postal arriba para mejores resultados.", also: "Prueba también",
    call: "¿Necesitas ayuda para encontrar algo? Llama al 211 Texas. Es gratis y conecta a las personas con servicios locales.", site: "Abrir 211 Texas",
    bTitle: "Ayuda con rutas de autobús", bLead: "Cómo funciona el autobús en el Valle del Río Grande y dónde ver las rutas y horarios oficiales.", from: "Desde", to: "Hasta", fromPh: "Mi dirección o escuela", toPh: "UTRGV Edinburg", plan: "Abrir el plan del viaje en Google Maps", planNote: "Abre una pestaña nueva con indicaciones de autobús.", needBoth: "Llena los dos lugares.",
    about: "Sobre Valley Metro", points: ["Valley Metro tiene autobuses entre muchas ciudades del Valle, como Edinburg, McAllen, Mission y más. El Consejo de Desarrollo del Bajo Valle del Río Grande comparte los mapas y horarios de las rutas.", "Algunas rutas conectan con el campus de UTRGV en Edinburg y con la Estación Central de McAllen.", "Metro McAllen lo opera la Ciudad de McAllen y cubre viajes dentro de la ciudad.", "No hay servicio de autobús en los días festivos importantes. Revisa el horario de tu ruta antes de salir.", "Valley Metro también ofrece recogida a la puerta si llamas con al menos un día de anticipación, cuando el viaje está cerca de una ruta. Llama al 1-800-574-8322 para preguntar."],
    vm: "Horarios y mapas de Valley Metro", tip: "Consejo: deja 10 minutos extra y ten un plan de respaldo para regresar a casa después de eventos nocturnos.", check: "Las rutas y horarios cambian. Revisa siempre el horario oficial.",
    eTitle: "Eventos locales", eLead: "Encuentra eventos de la ciudad, la biblioteca y las universidades para estudiantes. Estos enlaces buscan lo que hay ahora.", nearYou: "Eventos cerca de", find: "Buscar eventos", ideas: [["Eventos y programas para jóvenes", "eventos para jóvenes"], ["Eventos de biblioteca para niños y jóvenes", "eventos de biblioteca para jóvenes"], ["Casas abiertas y recorridos de universidades", "recorrido de campus universitario"], ["Ferias de empleo y carreras", "feria de empleo para estudiantes"], ["Talleres y clases gratis", "talleres gratis para estudiantes"], ["Días de voluntariado", "día de voluntariado"]] as [string, string][], eNote: "Revisa la fecha, el costo y las reglas de edad antes de ir, y avísale a un padre o tutor dónde estarás.",
  },
};

function usePlace() { return useLocalDoc<string>("finder-place", ""); }

export function BusTool() {
  const c = useCopy(copy);
  return (
    <Head title={c.bTitle} lead={c.bLead}>
      <h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.about}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-lg">{c.points.map((p) => <li key={p} className="max-w-prose">{p}</li>)}</ul>
      <p className="mt-4"><Ext href="https://www.lrgvdc.org/valleymetro.html">{c.vm}</Ext></p><p className="mt-2 max-w-prose">{c.tip}</p>
      <Callout>{c.check}</Callout>
    </Head>
  );
}

export function EventsTool() {
  const c = useCopy(copy);
  const [place, setPlace] = usePlace();
  return (
    <Head title={c.eTitle} lead={c.eLead}>
      <label className="mt-5 block max-w-sm"><span className="block font-bold">{c.place}</span><input value={place} onChange={(e) => setPlace(e.target.value)} placeholder={c.placePh} maxLength={60} className={`${inputClass} mt-1`} /></label>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">{c.ideas.map(([label, q]) => <li key={q} className="guide-card flex items-center justify-between gap-3 p-4"><span className="font-bold">{label}</span><Ext href={webSearch(`${q} ${place}`.trim())}>{c.find}</Ext></li>)}</ul>
      <Callout>{c.eNote}</Callout>
    </Head>
  );
}
