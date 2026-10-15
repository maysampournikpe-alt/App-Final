"use client";
import { useLang, useT } from "@/lib/i18n";
import { Page } from "../ui";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-2xl">{title}</h2>
      <ul className="max-w-prose list-disc space-y-2 pl-6 marker:text-terracotta">
        {items.map((x) => <li key={x}>{x}</li>)}
      </ul>
    </section>
  );
}

export function PrivacyTool() {
  const t = useT();
  const es = useLang() === "es";
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{t("privacyTitle")}</h1>
      <p className="mt-3 max-w-prose text-lg">
        {es
          ? "Esta app la hizo un estudiante del Valle del Río Grande. Aquí decimos en palabras sencillas qué guardamos y qué no."
          : "A student in the Rio Grande Valley made this app. Here is what it keeps and what it does not, in plain words."}
      </p>
      <List
        title={es ? "Lo que guardamos" : "What we keep"}
        items={es
          ? ["Tu nombre de usuario y tu contraseña. La contraseña se guarda cifrada y nadie, ni yo, puede leerla.",
             "Tu grado, tu escuela y tus intereses, solo si los escribes.",
             "Lo que guardas o creas en la app: oportunidades guardadas, planes, notas, calificaciones y resultados de práctica."]
          : ["Your username and password. The password is stored scrambled, so nobody, including the app's maker, can read it.",
             "Your grade, school and interests, only if you type them.",
             "What you save or make in the app: saved opportunities, plans, notes, grades and practice results."]}
      />
      <List
        title={es ? "Lo que NO pedimos" : "What we do not ask for"}
        items={es
          ? ["Tu nombre completo, correo, teléfono o dirección.", "Anuncios, cookies de rastreo o venta de tus datos. Nada de eso.",
             "Tus datos nunca se muestran a otros estudiantes."]
          : ["Your full name, email, phone number or address.", "Ads, tracking cookies or selling your data. None of that.",
             "Your information is never shown to other students."]}
      />
      <List
        title={es ? "Tu ubicación" : "Your location"}
        items={es
          ? ["Solo se usa cuando tú pides buscar cerca de ti. Puedes escribir una ciudad o código postal en vez de compartir tu ubicación.",
             "Se manda al buscador como ciudad o código postal. No guardamos un historial de dónde has estado."]
          : ["Only used when you ask to search near you. You can type a city or ZIP code instead of sharing your location.",
             "It goes to the search as a city or ZIP code. We do not keep a history of where you have been."]}
      />
      <List
        title={es ? "Lo que escribes a la IA" : "What you type to the AI"}
        items={es
          ? ["Lo que escribes en el Coach y en las búsquedas se manda a un servicio de IA (Groq) para armar la respuesta.",
             "No escribas datos privados como direcciones, números de teléfono o contraseñas.",
             "Si algo te preocupa de verdad, habla con un adulto de confianza o con tu consejero escolar."]
          : ["What you type in the Coach and in searches is sent to an AI service (Groq) to make the answer.",
             "Do not type private details like addresses, phone numbers or passwords.",
             "If something is really bothering you, talk to a trusted adult or your school counselor."]}
      />
      <List
        title={es ? "Invitado, borrar y descargar" : "Guest mode, deleting and downloading"}
        items={es
          ? ["Como invitado, todo se queda solo en tu dispositivo.",
             "En Ajustes → Cuenta puedes descargar tus datos o borrar tu cuenta y todo lo que contiene."]
          : ["As a guest, everything stays only on your device.",
             "In Settings → Account you can download your data or delete your account and everything in it."]}
      />
    </Page>
  );
}

export function TransparencyTool() {
  const t = useT();
  const es = useLang() === "es";
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{t("transparencyTitle")}</h1>
      <p className="mt-3 max-w-prose text-lg">
        {es
          ? "La IA ayuda, pero se equivoca. Esto es lo que hace y lo que no hace."
          : "The AI helps, but it makes mistakes. Here is what it does and what it does not."}
      </p>
      <List
        title={es ? "Cómo encuentra oportunidades" : "How it finds opportunities"}
        items={es
          ? ["Busca en sitios web públicos y te muestra los enlaces que usó. Siempre revisa la fuente.",
             "No puede entrar a redes sociales ni a cuentas privadas.",
             "Nunca debe inventar ofertas. Si no encuentra una confirmada, te lo dice y te sugiere a quién preguntar.",
             "Fechas, costos y requisitos pueden cambiar. Confirma con quien organiza."]
          : ["It searches public websites and shows the links it used. Always check the source.",
             "It cannot log in to social media or private accounts.",
             "It must never invent listings. If it cannot confirm one, it says so and suggests who to ask.",
             "Dates, costs and rules change. Confirm with the organizer."]}
      />
      <List
        title={es ? "Preguntas de práctica y calificaciones" : "Practice questions and scores"}
        items={es
          ? ["Las preguntas de práctica las hace la IA y se revisan antes de mostrarse, pero pueden tener errores. Usa “Reportar un problema”.",
             "Los puntajes estimados no son oficiales. Solo te dan una idea."]
          : ["Practice questions are made by AI and checked before you see them, but they can still have mistakes. Use “Report a problem”.",
             "Estimated scores are not official. They only give you an idea."]}
      />
      <List
        title={es ? "Cómo se eligen tus recomendaciones" : "How your recommendations are chosen"}
        items={es
          ? ["Con tus intereses, tu grado, tu zona y lo que guardas o rechazas. Cada una dice por qué te la mostramos.",
             "Una de cada cinco sale de fuera de tus intereses para que descubras cosas nuevas, y está marcada.",
             "Puedes reiniciar tus recomendaciones cuando quieras."]
          : ["From your interests, grade, area and what you save or reject. Each one says why you are seeing it.",
             "One in five comes from outside your interests so you can discover new things, and it is labeled.",
             "You can reset your recommendations any time."]}
      />
      <List
        title={es ? "Lo que todavía no está" : "What is not live yet"}
        items={es
          ? ["Las funciones con la etiqueta “Próximamente” todavía no funcionan. Se explican en su página."]
          : ["Features with the “Coming soon” badge are not live yet. Each one explains what it will do."]}
      />
    </Page>
  );
}
