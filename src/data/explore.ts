// Careers, majors, colleges, scholarships, courses and quotes. Bilingual. No pay numbers or prices:
// those change every year, so each entry links to the official source instead of copying a number that could be wrong.
import type { L } from "@/components/tools/shared";
import type { Tag } from "./guides";

const l = (en: string, es: string): L => ({ en, es });

/* ---------- Careers ---------- */
export type Edu = "hs" | "cert" | "assoc" | "bach" | "master" | "doctoral";
export const EDU_LABEL: Record<Edu, L> = {
  hs: l("High school diploma, then on-the-job training or an apprenticeship", "Diploma de preparatoria, luego capacitación en el trabajo o aprendizaje"),
  cert: l("A certificate or short training program after high school", "Un certificado o programa corto de capacitación después de la preparatoria"),
  assoc: l("Associate degree (about 2 years)", "Título asociado (unos 2 años)"),
  bach: l("Bachelor's degree (about 4 years)", "Licenciatura (unos 4 años)"),
  master: l("Master's degree (bachelor's plus about 2 more years)", "Maestría (licenciatura más unos 2 años)"),
  doctoral: l("Doctoral or professional degree (many years of school)", "Doctorado o título profesional (muchos años de estudio)"),
};
export type Riasec = "R" | "I" | "A" | "S" | "E" | "C";
export interface Career { id: string; name: L; edu: Edu; day: L; tags: Tag[]; codes: [Riasec, Riasec]; search: string; videos: string }
const c = (id: string, en: string, es: string, edu: Edu, dayEn: string, dayEs: string, tags: Tag[], codes: [Riasec, Riasec], search: string, videos = en): Career =>
  ({ id, name: l(en, es), edu, day: l(dayEn, dayEs), tags, codes, search, videos });

export const CAREERS: Career[] = [
  c("rn", "Registered nurse", "Enfermero o enfermera registrado", "bach", "Checks on patients, gives medicine, teaches families and works with doctors.", "Revisa a los pacientes, da medicinas, enseña a las familias y trabaja con médicos.", ["health", "service"], ["S", "I"], "registered nurse"),
  c("cna", "Nursing assistant", "Asistente de enfermería", "cert", "Helps patients with daily care and tells nurses how they are doing.", "Ayuda a los pacientes con el cuidado diario e informa a las enfermeras cómo están.", ["health", "service"], ["S", "R"], "nursing assistant"),
  c("lvn", "Licensed vocational nurse", "Enfermero vocacional con licencia", "cert", "Gives basic nursing care under the direction of nurses and doctors.", "Da cuidados básicos de enfermería bajo la dirección de enfermeras y médicos.", ["health"], ["S", "R"], "licensed practical nurse"),
  c("doctor", "Physician (doctor)", "Médico", "doctoral", "Examines patients, finds what is wrong and plans treatment.", "Examina a los pacientes, descubre qué tienen y planea el tratamiento.", ["health", "stem"], ["I", "S"], "physician"),
  c("pa", "Physician assistant", "Asistente médico (PA)", "master", "Examines patients, orders tests and helps treat them, working with doctors.", "Examina a los pacientes, ordena pruebas y ayuda a tratarlos, trabajando con médicos.", ["health", "stem"], ["I", "S"], "physician assistant"),
  c("dh", "Dental hygienist", "Higienista dental", "assoc", "Cleans teeth, checks for problems and teaches patients to care for their teeth.", "Limpia dientes, busca problemas y enseña a los pacientes a cuidar sus dientes.", ["health"], ["S", "R"], "dental hygienist"),
  c("pharm", "Pharmacist", "Farmacéutico", "doctoral", "Fills prescriptions safely and explains medicines to patients.", "Surte recetas con seguridad y explica las medicinas a los pacientes.", ["health", "stem"], ["I", "C"], "pharmacist"),
  c("pt", "Physical therapist", "Fisioterapeuta", "doctoral", "Helps people recover from injuries with exercises and treatments.", "Ayuda a las personas a recuperarse de lesiones con ejercicios y tratamientos.", ["health", "sports"], ["S", "I"], "physical therapist"),
  c("vet", "Veterinarian", "Veterinario", "doctoral", "Examines and treats sick and injured animals.", "Examina y trata animales enfermos o lastimados.", ["health", "outdoors"], ["I", "R"], "veterinarian"),
  c("emt", "EMT and paramedic", "Paramédico y EMT", "cert", "Responds to emergencies, gives first care and gets patients to the hospital.", "Responde a emergencias, da los primeros cuidados y lleva a los pacientes al hospital.", ["health", "service"], ["S", "R"], "emergency medical technician paramedic"),
  c("ma", "Medical assistant", "Asistente médico", "cert", "Takes vital signs, prepares patients and does office tasks in a clinic.", "Toma signos vitales, prepara a los pacientes y hace tareas de oficina en una clínica.", ["health"], ["S", "C"], "medical assistant"),
  c("swe", "Software developer", "Desarrollador de software", "bach", "Designs, writes and tests the code behind apps and websites.", "Diseña, escribe y prueba el código detrás de apps y sitios web.", ["tech", "stem"], ["I", "C"], "software developer"),
  c("infosec", "Cybersecurity analyst", "Analista de ciberseguridad", "bach", "Protects computers and networks from attacks and fixes weak spots.", "Protege computadoras y redes de ataques y arregla los puntos débiles.", ["tech", "stem"], ["I", "C"], "information security analyst"),
  c("web", "Web developer", "Desarrollador web", "assoc", "Builds and maintains websites, working with designers and clients.", "Construye y mantiene sitios web, trabajando con diseñadores y clientes.", ["tech", "arts"], ["A", "I"], "web developer"),
  c("it", "Computer support specialist", "Especialista de soporte técnico", "cert", "Helps people fix computer and network problems.", "Ayuda a la gente a resolver problemas de computadoras y redes.", ["tech", "service"], ["R", "S"], "computer user support specialist"),
  c("me", "Mechanical engineer", "Ingeniero mecánico", "bach", "Designs and tests machines, from engines to robots.", "Diseña y prueba máquinas, desde motores hasta robots.", ["stem", "tech"], ["I", "R"], "mechanical engineer"),
  c("ce", "Civil engineer", "Ingeniero civil", "bach", "Plans and oversees roads, bridges, water systems and buildings.", "Planea y supervisa carreteras, puentes, sistemas de agua y edificios.", ["stem", "outdoors"], ["I", "R"], "civil engineer"),
  c("ee", "Electrical engineer", "Ingeniero eléctrico", "bach", "Designs electrical systems and electronics.", "Diseña sistemas eléctricos y electrónicos.", ["stem", "tech"], ["I", "R"], "electrical engineer"),
  c("elec", "Electrician", "Electricista", "hs", "Installs and repairs wiring and electrical systems, often as part of a paid apprenticeship.", "Instala y repara cables y sistemas eléctricos, muchas veces como parte de un aprendizaje pagado.", ["trades"], ["R", "C"], "electrician"),
  c("plumb", "Plumber", "Plomero", "hs", "Installs and repairs pipes and fixtures. Training is usually an apprenticeship.", "Instala y repara tuberías y accesorios. La capacitación suele ser un aprendizaje.", ["trades"], ["R", "C"], "plumber"),
  c("weld", "Welder", "Soldador", "hs", "Joins metal parts using heat. Training can start in high school or at a technical college.", "Une piezas de metal con calor. La capacitación puede empezar en la preparatoria o en una universidad técnica.", ["trades"], ["R", "C"], "welder"),
  c("hvac", "HVAC technician", "Técnico de HVAC (aire acondicionado)", "cert", "Installs and repairs heating, cooling and refrigeration systems.", "Instala y repara sistemas de calefacción, aire acondicionado y refrigeración.", ["trades"], ["R", "C"], "heating air conditioning refrigeration mechanic"),
  c("auto", "Automotive technician", "Técnico automotriz", "cert", "Diagnoses and repairs cars and trucks.", "Diagnostica y repara autos y camionetas.", ["trades", "tech"], ["R", "I"], "automotive service technician"),
  c("elemt", "Elementary school teacher", "Maestro de primaria", "bach", "Teaches many subjects to young students and prepares lessons.", "Enseña muchas materias a estudiantes pequeños y prepara las lecciones.", ["teaching", "service"], ["S", "A"], "elementary school teacher"),
  c("hst", "High school teacher", "Maestro de preparatoria", "bach", "Teaches a subject, plans lessons and helps students prepare for life after school.", "Enseña una materia, planea lecciones y ayuda a los estudiantes a prepararse para la vida después de la escuela.", ["teaching", "service"], ["S", "I"], "high school teacher"),
  c("counsel", "School counselor", "Consejero escolar", "master", "Helps students with classes, college plans and personal challenges.", "Ayuda a los estudiantes con clases, planes universitarios y retos personales.", ["teaching", "service"], ["S", "E"], "school counselor"),
  c("law", "Lawyer", "Abogado", "doctoral", "Advises people and businesses on the law and speaks for them in court.", "Aconseja a personas y negocios sobre la ley y habla por ellos en la corte.", ["law"], ["E", "I"], "lawyer"),
  c("para", "Paralegal", "Asistente legal (paralegal)", "assoc", "Researches law and prepares documents to help lawyers.", "Investiga leyes y prepara documentos para ayudar a los abogados.", ["law"], ["C", "I"], "paralegal"),
  c("police", "Police officer", "Oficial de policía", "hs", "Patrols, responds to calls and helps keep the community safe. Training happens at a police academy.", "Patrulla, responde a llamadas y ayuda a mantener segura a la comunidad. La capacitación es en una academia de policía.", ["service"], ["E", "R"], "police patrol officer"),
  c("fire", "Firefighter", "Bombero", "cert", "Responds to fires and emergencies and often works as an EMT.", "Responde a incendios y emergencias y muchas veces trabaja también como EMT.", ["service"], ["R", "S"], "firefighter"),
  c("acct", "Accountant", "Contador", "bach", "Keeps financial records, prepares taxes and helps businesses plan.", "Lleva registros financieros, prepara impuestos y ayuda a los negocios a planear.", ["business"], ["C", "E"], "accountant auditor"),
  c("mkt", "Marketing specialist", "Especialista en mercadotecnia", "bach", "Plans how to tell people about a product or service.", "Planea cómo informar a la gente sobre un producto o servicio.", ["business", "arts"], ["E", "A"], "market research analyst marketing specialist"),
  c("gd", "Graphic designer", "Diseñador gráfico", "bach", "Creates logos, posters, websites and other visual designs.", "Crea logotipos, carteles, sitios web y otros diseños visuales.", ["arts", "tech"], ["A", "E"], "graphic designer"),
  c("film", "Film and video editor", "Editor de cine y video", "bach", "Puts video and sound together to tell a story.", "Une video y sonido para contar una historia.", ["arts", "tech"], ["A", "R"], "film and video editor"),
  c("chef", "Chef or cook", "Chef o cocinero", "hs", "Plans menus, prepares food and runs a kitchen. Many learn on the job or in culinary school.", "Planea menús, prepara comida y dirige una cocina. Muchos aprenden en el trabajo o en una escuela de cocina.", ["trades", "business"], ["R", "A"], "chefs and head cooks"),
  c("pilot", "Commercial pilot", "Piloto comercial", "cert", "Flies aircraft and plans flights. Pilots need FAA licenses and many flight hours.", "Vuela aviones y planea vuelos. Los pilotos necesitan licencias de la FAA y muchas horas de vuelo.", ["stem", "trades"], ["R", "I"], "commercial pilot"),
  c("sw", "Social worker", "Trabajador social", "bach", "Helps people and families find support and solve problems.", "Ayuda a personas y familias a encontrar apoyo y resolver problemas.", ["service"], ["S", "E"], "social worker"),
  c("env", "Environmental scientist", "Científico ambiental", "bach", "Studies air, water and land and helps protect them.", "Estudia el aire, el agua y la tierra y ayuda a protegerlos.", ["outdoors", "stem"], ["I", "R"], "environmental scientist"),
  c("interp", "Interpreter and translator", "Intérprete y traductor", "bach", "Helps people who speak different languages understand each other.", "Ayuda a personas que hablan idiomas distintos a entenderse.", ["language"], ["A", "S"], "interpreter translator"),
  c("journo", "Journalist", "Periodista", "bach", "Finds facts, interviews people and writes or reports the news.", "Busca datos, entrevista a personas y escribe o reporta las noticias.", ["language", "arts"], ["A", "E"], "reporter journalist"),
];

/* ---------- Interest quiz (six types of interests, three questions each) ---------- */
export interface QuizQ { code: Riasec; text: L }
const q = (code: Riasec, en: string, es: string): QuizQ => ({ code, text: l(en, es) });
export const QUIZ: QuizQ[] = [
  q("R", "I like fixing things or building with my hands.", "Me gusta arreglar cosas o construir con las manos."),
  q("I", "I like figuring out how or why something works.", "Me gusta descubrir cómo o por qué funciona algo."),
  q("A", "I like making art, music, videos or stories.", "Me gusta hacer arte, música, videos o historias."),
  q("S", "I like helping people with their problems.", "Me gusta ayudar a la gente con sus problemas."),
  q("E", "I like leading a group or convincing people.", "Me gusta liderar un grupo o convencer a la gente."),
  q("C", "I like organizing things and keeping records neat.", "Me gusta organizar cosas y mantener registros ordenados."),
  q("R", "I would rather work outside or with tools than at a desk.", "Prefiero trabajar al aire libre o con herramientas que en un escritorio."),
  q("I", "I enjoy science experiments, puzzles or math challenges.", "Disfruto experimentos de ciencias, acertijos o retos de matemáticas."),
  q("A", "I like coming up with new and different ideas.", "Me gusta inventar ideas nuevas y diferentes."),
  q("S", "I enjoy teaching or explaining things to others.", "Disfruto enseñar o explicar cosas a otros."),
  q("E", "I like starting projects or businesses of my own.", "Me gusta empezar proyectos o negocios propios."),
  q("C", "I like following clear steps and getting details right.", "Me gusta seguir pasos claros y hacer bien los detalles."),
  q("R", "I like machines, vehicles, or how things are made.", "Me gustan las máquinas, los vehículos o cómo se hacen las cosas."),
  q("I", "I like reading or researching to learn something new.", "Me gusta leer o investigar para aprender algo nuevo."),
  q("A", "I like expressing myself through writing, design or performing.", "Me gusta expresarme escribiendo, diseñando o actuando."),
  q("S", "I care about my community and like to volunteer.", "Me importa mi comunidad y me gusta ser voluntario."),
  q("E", "I like competing and taking charge to reach a goal.", "Me gusta competir y tomar el mando para lograr una meta."),
  q("C", "I like working with numbers, schedules or data.", "Me gusta trabajar con números, horarios o datos."),
];
export const RIASEC_NAMES: Record<Riasec, L> = {
  R: l("Hands-on builder", "Constructor práctico"), I: l("Investigator", "Investigador"), A: l("Creator", "Creador"),
  S: l("Helper", "Ayudante"), E: l("Leader", "Líder"), C: l("Organizer", "Organizador"),
};

/* ---------- Majors ---------- */
export interface Major { id: string; name: L; study: L; leads: string[]; tags: Tag[] }
const m = (id: string, en: string, es: string, sEn: string, sEs: string, leads: string[], tags: Tag[]): Major => ({ id, name: l(en, es), study: l(sEn, sEs), leads, tags });
export const MAJORS: Major[] = [
  m("nursing", "Nursing", "Enfermería", "Anatomy, patient care, medicine and hands-on hospital training.", "Anatomía, cuidado de pacientes, medicina y práctica en hospitales.", ["rn", "lvn"], ["health"]),
  m("biology", "Biology", "Biología", "Living things, cells, genetics and ecosystems. A common start for medicine and research.", "Seres vivos, células, genética y ecosistemas. Un comienzo común para medicina e investigación.", ["doctor", "pharm", "vet", "env"], ["stem", "health"]),
  m("chem", "Chemistry", "Química", "Matter and how it changes, with lots of lab work.", "La materia y cómo cambia, con mucho trabajo de laboratorio.", ["pharm", "env", "doctor"], ["stem"]),
  m("cs", "Computer science", "Ciencias de la computación", "Programming, algorithms, data and how computers work.", "Programación, algoritmos, datos y cómo funcionan las computadoras.", ["swe", "infosec", "web"], ["tech", "stem"]),
  m("eng-mech", "Mechanical engineering", "Ingeniería mecánica", "Physics, math and design of machines and systems.", "Física, matemáticas y diseño de máquinas y sistemas.", ["me"], ["stem"]),
  m("eng-civil", "Civil engineering", "Ingeniería civil", "Structures, materials and planning for roads, water and buildings.", "Estructuras, materiales y planeación de carreteras, agua y edificios.", ["ce"], ["stem"]),
  m("eng-elec", "Electrical engineering", "Ingeniería eléctrica", "Circuits, electronics, power and signals.", "Circuitos, electrónica, energía y señales.", ["ee"], ["stem", "tech"]),
  m("math", "Math", "Matemáticas", "Problem solving, proofs and statistics. Useful in almost every field.", "Resolución de problemas, demostraciones y estadística. Útil en casi todos los campos.", ["acct", "swe"], ["stem"]),
  m("edu", "Education", "Educación", "How people learn, classroom skills and a subject to teach.", "Cómo aprende la gente, habilidades de aula y una materia para enseñar.", ["elemt", "hst", "counsel"], ["teaching"]),
  m("psych", "Psychology", "Psicología", "How people think, feel and behave.", "Cómo piensa, siente y se comporta la gente.", ["counsel", "sw"], ["service", "health"]),
  m("socwork", "Social work", "Trabajo social", "Helping people and families, community resources and counseling skills.", "Ayudar a personas y familias, recursos comunitarios y habilidades de consejería.", ["sw"], ["service"]),
  m("crim", "Criminal justice", "Justicia penal", "How laws, courts and police work together.", "Cómo trabajan juntos las leyes, los tribunales y la policía.", ["police", "law", "para"], ["law", "service"]),
  m("polisci", "Political science", "Ciencias políticas", "Government, policy and law. A common start for law school.", "Gobierno, políticas y leyes. Un comienzo común para la escuela de derecho.", ["law"], ["law"]),
  m("business", "Business", "Negocios", "Management, marketing, finance and how companies run.", "Administración, mercadotecnia, finanzas y cómo funcionan las empresas.", ["acct", "mkt"], ["business"]),
  m("acct", "Accounting", "Contabilidad", "Financial records, taxes and auditing.", "Registros financieros, impuestos y auditoría.", ["acct"], ["business"]),
  m("marketing", "Marketing", "Mercadotecnia", "Understanding customers and telling people about a product.", "Entender a los clientes y dar a conocer un producto.", ["mkt"], ["business", "arts"]),
  m("design", "Graphic design", "Diseño gráfico", "Visual design, typography and digital tools.", "Diseño visual, tipografía y herramientas digitales.", ["gd", "web"], ["arts", "tech"]),
  m("media", "Film and media", "Cine y medios", "Video, sound, storytelling and production.", "Video, sonido, narrativa y producción.", ["film", "journo"], ["arts"]),
  m("english", "English and writing", "Inglés y escritura", "Reading closely, writing clearly and arguing well.", "Leer con atención, escribir con claridad y argumentar bien.", ["journo", "law", "hst"], ["language"]),
  m("languages", "Languages", "Idiomas", "Speaking, reading and writing another language and its culture.", "Hablar, leer y escribir otro idioma y su cultura.", ["interp", "hst"], ["language"]),
  m("envsci", "Environmental science", "Ciencias ambientales", "Ecosystems, climate, water and how people affect the planet.", "Ecosistemas, clima, agua y cómo las personas afectan el planeta.", ["env"], ["outdoors", "stem"]),
  m("kines", "Kinesiology", "Kinesiología", "How the body moves, exercise science and sports health.", "Cómo se mueve el cuerpo, ciencia del ejercicio y salud deportiva.", ["pt"], ["sports", "health"]),
  m("aviation", "Aviation", "Aviación", "Flight training, aircraft systems and air safety.", "Entrenamiento de vuelo, sistemas de aeronaves y seguridad aérea.", ["pilot"], ["stem", "trades"]),
  m("culinary", "Culinary arts", "Artes culinarias", "Cooking technique, kitchen management and food safety.", "Técnica de cocina, administración de cocinas y seguridad alimentaria.", ["chef"], ["trades", "business"]),
];

/* ---------- Colleges ---------- */
export interface College { id: string; name: string; city: string; kind: L; note: L; url: string; tags: Tag[]; local: boolean }
const col = (id: string, name: string, city: string, kEn: string, kEs: string, nEn: string, nEs: string, url: string, tags: Tag[], local = false): College =>
  ({ id, name, city, kind: l(kEn, kEs), note: l(nEn, nEs), url, tags, local });
export const COLLEGES: College[] = [
  col("utrgv", "The University of Texas Rio Grande Valley (UTRGV)", "Edinburg and Brownsville", "Public university", "Universidad pública", "A large university in the Valley with a medical school, and programs in health, education, engineering, business and more.", "Una universidad grande en el Valle con escuela de medicina y programas de salud, educación, ingeniería, negocios y más.", "https://www.utrgv.edu/", ["health", "stem", "teaching", "business", "law"], true),
  col("stc", "South Texas College (STC)", "McAllen, Pharr, Weslaco and Rio Grande City", "Community college", "Colegio comunitario", "Associate degrees, certificates and technical programs, with a strong dual enrollment program for high school students.", "Títulos asociados, certificados y programas técnicos, con un programa fuerte de inscripción doble para estudiantes de preparatoria.", "https://www.southtexascollege.edu/", ["trades", "health", "tech"], true),
  col("tsc", "Texas Southmost College (TSC)", "Brownsville", "Community college", "Colegio comunitario", "Associate degrees and certificates in Brownsville, including technical and health programs.", "Títulos asociados y certificados en Brownsville, incluidos programas técnicos y de salud.", "https://www.tsc.edu/", ["trades", "health"], true),
  col("tamuk", "Texas A&M University-Kingsville", "Kingsville", "Public university", "Universidad pública", "A public university known for engineering and agriculture, about 1.5 hours north of the Valley.", "Una universidad pública conocida por ingeniería y agricultura, a unas 1.5 horas al norte del Valle.", "https://www.tamuk.edu/", ["stem", "outdoors"]),
  col("tamucc", "Texas A&M University-Corpus Christi", "Corpus Christi", "Public university", "Universidad pública", "A university on Corpus Christi Bay with strong marine science and nursing programs.", "Una universidad en la bahía de Corpus Christi con programas fuertes de ciencias marinas y enfermería.", "https://www.tamucc.edu/", ["outdoors", "health", "stem"]),
  col("utsa", "University of Texas at San Antonio (UTSA)", "San Antonio", "Public university", "Universidad pública", "A large urban university with programs in business, engineering, cybersecurity and the arts.", "Una universidad urbana grande con programas de negocios, ingeniería, ciberseguridad y artes.", "https://www.utsa.edu/", ["business", "tech", "arts", "stem"]),
  col("txst", "Texas State University", "San Marcos", "Public university", "Universidad pública", "A large public university between Austin and San Antonio.", "Una universidad pública grande entre Austin y San Antonio.", "https://www.txst.edu/", ["teaching", "business", "arts"]),
  col("uh", "University of Houston", "Houston", "Public university", "Universidad pública", "A large urban research university with many majors.", "Una universidad urbana de investigación con muchas carreras.", "https://uh.edu/", ["business", "stem", "arts"]),
  col("ut", "The University of Texas at Austin", "Austin", "Public university (flagship)", "Universidad pública (principal)", "The state's flagship university. Highly competitive, with automatic admission for students near the top of their class.", "La universidad principal del estado. Muy competitiva, con admisión automática para estudiantes cerca de la cima de su clase.", "https://www.utexas.edu/", ["stem", "business", "law", "arts"]),
  col("tamu", "Texas A&M University", "College Station", "Public university", "Universidad pública", "A large university known for engineering, agriculture and business.", "Una universidad grande conocida por ingeniería, agricultura y negocios.", "https://www.tamu.edu/", ["stem", "outdoors", "business"]),
  col("ttu", "Texas Tech University", "Lubbock", "Public university", "Universidad pública", "A large university in West Texas with many majors.", "Una universidad grande en el oeste de Texas con muchas carreras.", "https://www.ttu.edu/", ["business", "outdoors", "stem"]),
];

/* ---------- Scholarships ---------- */
export interface Scholarship { id: string; name: string; who: L; note: L; url: string; grades: [number, number]; need?: boolean; hispanic?: boolean; texas?: boolean }
const sch = (id: string, name: string, wEn: string, wEs: string, nEn: string, nEs: string, url: string, grades: [number, number], f: Partial<Scholarship> = {}): Scholarship =>
  ({ id, name, who: l(wEn, wEs), note: l(nEn, nEs), url, grades, ...f });
export const SCHOLARSHIPS: Scholarship[] = [
  sch("hsf", "Hispanic Scholarship Fund (HSF)", "Students of Hispanic heritage going to college.", "Estudiantes de herencia hispana que van a la universidad.", "One of the largest scholarship programs for Hispanic students. Read the current rules on the site.", "Uno de los programas de becas más grandes para estudiantes hispanos. Lee las reglas actuales en el sitio.", "https://www.hsf.net/", [12, 12], { hispanic: true }),
  sch("gates", "The Gates Scholarship", "High school seniors with financial need from several minority groups, including Hispanic American students.", "Estudiantes de último año con necesidad económica de varios grupos minoritarios, incluidos los hispanoamericanos.", "A full-need scholarship for students who qualify for the Pell Grant.", "Una beca de necesidad completa para estudiantes que califican para la beca Pell.", "https://www.thegatesscholarship.org/", [12, 12], { need: true, hispanic: true }),
  sch("questbridge", "QuestBridge", "High-achieving students from low-income families. Juniors and seniors can apply to different programs.", "Estudiantes de alto rendimiento de familias de bajos ingresos. Los de 11.º y 12.º grado pueden aplicar a programas distintos.", "Matches students with top colleges that offer full scholarships.", "Conecta a estudiantes con universidades de primer nivel que ofrecen becas completas.", "https://www.questbridge.org/", [11, 12], { need: true }),
  sch("dell", "Dell Scholars", "Students with financial need who take part in an approved college-readiness program.", "Estudiantes con necesidad económica que participan en un programa aprobado de preparación universitaria.", "Includes money and support through college. Ask your counselor if your school has a qualifying program.", "Incluye dinero y apoyo durante la universidad. Pregunta a tu consejero si tu escuela tiene un programa que califique.", "https://www.dellscholars.org/", [12, 12], { need: true }),
  sch("cocacola", "Coca-Cola Scholars Program", "High school seniors who show leadership and service.", "Estudiantes de último año que muestran liderazgo y servicio.", "A national scholarship. Check the eligibility rules on the site.", "Una beca nacional. Revisa las reglas de elegibilidad en el sitio.", "https://www.coca-colascholarsfoundation.org/", [12, 12]),
  sch("nationalmerit", "National Merit Scholarship Program", "Students who take the PSAT/NMSQT in 11th grade.", "Estudiantes que toman el PSAT/NMSQT en 11.º grado.", "Your PSAT score in 11th grade is what counts. Practice for the PSAT in Test Prep.", "Cuenta tu puntaje del PSAT en 11.º grado. Practica para el PSAT en Exámenes.", "https://www.nationalmerit.org/", [10, 11]),
  sch("jkcf", "Jack Kent Cooke Foundation Young Scholars", "High-achieving 7th graders from families with lower incomes.", "Estudiantes de 7.º grado de alto rendimiento de familias de menores ingresos.", "Supports students through high school. You apply in 7th grade.", "Apoya a los estudiantes durante la preparatoria. Se aplica en 7.º grado.", "https://www.jkcf.org/", [7, 7], { need: true }),
  sch("horatioalger", "Horatio Alger Association scholarships", "Students who have overcome hardship and have financial need.", "Estudiantes que han superado dificultades y tienen necesidad económica.", "Several scholarship programs. Read the current requirements.", "Varios programas de becas. Lee los requisitos actuales.", "https://scholars.horatioalger.org/", [12, 12], { need: true }),
  sch("hhf", "Hispanic Heritage Foundation Youth Awards", "Latino high school students with leadership and service.", "Estudiantes latinos de preparatoria con liderazgo y servicio.", "Awards and national recognition for young Latino leaders.", "Premios y reconocimiento nacional para jóvenes líderes latinos.", "https://hispanicheritage.org/", [9, 12], { hispanic: true }),
  sch("texasgrant", "TEXAS Grant", "Texas residents with financial need who go to a Texas public college.", "Residentes de Texas con necesidad económica que van a una universidad pública de Texas.", "State grant money. You usually need to file the FAFSA or TASFA and meet the deadline.", "Dinero de una subvención estatal. Normalmente necesitas llenar la FAFSA o TASFA y cumplir la fecha límite.", "https://collegeforalltexans.com/", [12, 12], { need: true, texas: true }),
  sch("bigfuture", "BigFuture Scholarship Search (College Board)", "Any student. A free search tool with thousands of scholarships.", "Cualquier estudiante. Una herramienta de búsqueda gratis con miles de becas.", "Use filters for your grade, interests and state.", "Usa filtros para tu grado, intereses y estado.", "https://bigfuture.collegeboard.org/scholarships", [9, 12]),
  sch("collegescholar", "Your college's own scholarships", "Students who apply to and attend that college.", "Estudiantes que solicitan y asisten a esa universidad.", "Colleges give a lot of their own scholarship money. Apply to the college and ask the financial aid office.", "Las universidades dan mucho dinero de becas propias. Solicita en la universidad y pregunta en la oficina de ayuda económica.", "https://www.utrgv.edu/", [12, 12], { texas: true }),
];

/* ---------- Free courses ---------- */
export interface Course { id: string; name: string; what: L; url: string; tags: Tag[] }
const co = (id: string, name: string, wEn: string, wEs: string, url: string, tags: Tag[]): Course => ({ id, name, what: l(wEn, wEs), url, tags });
export const COURSES: Course[] = [
  co("khan", "Khan Academy", "Free lessons and practice in math, science, economics and more, plus SAT practice.", "Lecciones y práctica gratis de matemáticas, ciencias, economía y más, además de práctica del SAT.", "https://www.khanacademy.org/", ["stem", "business"]),
  co("fcc", "freeCodeCamp", "Learn web development and coding for free, with projects.", "Aprende desarrollo web y programación gratis, con proyectos.", "https://www.freecodecamp.org/", ["tech"]),
  co("codeorg", "Code.org", "Beginner-friendly computer science lessons.", "Lecciones de ciencias de la computación para principiantes.", "https://code.org/", ["tech", "stem"]),
  co("scratch", "Scratch", "Make games and animations by snapping code blocks together.", "Haz juegos y animaciones uniendo bloques de código.", "https://scratch.mit.edu/", ["tech", "arts"]),
  co("ck12", "CK-12", "Free textbooks, videos and practice in science and math.", "Libros de texto, videos y práctica gratis de ciencias y matemáticas.", "https://www.ck12.org/", ["stem"]),
  co("ocw", "MIT OpenCourseWare", "Free materials from real MIT courses. Challenging, and great for advanced students.", "Materiales gratis de cursos reales de MIT. Desafiante, y excelente para estudiantes avanzados.", "https://ocw.mit.edu/", ["stem", "tech"]),
  co("duolingo", "Duolingo", "Free language practice, a few minutes a day.", "Práctica gratis de idiomas, unos minutos al día.", "https://www.duolingo.com/", ["language"]),
  co("gutenberg", "Project Gutenberg", "Free classic books to read online.", "Libros clásicos gratis para leer en línea.", "https://www.gutenberg.org/", ["language"]),
  co("icivics", "iCivics", "Free games and lessons about government and law.", "Juegos y lecciones gratis sobre el gobierno y las leyes.", "https://www.icivics.org/", ["law"]),
  co("typing", "Typing.com", "Free typing lessons and games.", "Lecciones y juegos de mecanografía gratis.", "https://www.typing.com/", ["tech", "business"]),
  co("lichess", "Lichess", "Free chess lessons, puzzles and games.", "Lecciones, problemas y partidas de ajedrez gratis.", "https://lichess.org/learn", ["stem"]),
  co("musictheory", "musictheory.net", "Free music theory lessons and ear training.", "Lecciones gratis de teoría musical y entrenamiento del oído.", "https://www.musictheory.net/", ["arts"]),
  co("artsculture", "Google Arts & Culture", "Explore museums, art and history from around the world.", "Explora museos, arte e historia de todo el mundo.", "https://artsandculture.google.com/", ["arts"]),
  co("noaa", "NOAA Education", "Ocean, weather and climate science resources.", "Recursos de ciencias del océano, el clima y el tiempo.", "https://www.noaa.gov/education", ["outdoors", "stem"]),
  co("nasa", "NASA STEM", "Space and science activities and careers.", "Actividades y carreras de espacio y ciencias.", "https://www.nasa.gov/learning-resources/", ["stem"]),
  co("ja", "Junior Achievement", "Business, money and entrepreneurship programs, often through schools.", "Programas de negocios, dinero y emprendimiento, muchas veces por medio de las escuelas.", "https://www.juniorachievement.org/", ["business"]),
  co("volmatch", "VolunteerMatch", "Find volunteer openings that fit your interests.", "Encuentra oportunidades de voluntariado que se ajusten a tus intereses.", "https://www.volunteermatch.org/", ["service"]),
  co("dosomething", "DoSomething", "Youth-led volunteer campaigns you can join from anywhere.", "Campañas de voluntariado dirigidas por jóvenes a las que te puedes unir desde cualquier lugar.", "https://www.dosomething.org/", ["service"]),
  co("myNextMove", "My Next Move", "Career interest tool and information from the U.S. Department of Labor.", "Herramienta de intereses profesionales e información del Departamento de Trabajo de EE. UU.", "https://www.mynextmove.org/", ["business", "service"]),
  co("khanhealth", "Khan Academy: Health and medicine", "Free lessons on the body, health and medicine.", "Lecciones gratis sobre el cuerpo, la salud y la medicina.", "https://www.khanacademy.org/science/health-and-medicine", ["health"]),
  co("khanteach", "Khan Academy for learners and tutors", "Practice a subject, then help others learn it.", "Practica una materia y luego ayuda a otros a aprenderla.", "https://www.khanacademy.org/", ["teaching"]),
  co("apprentice", "Apprenticeship.gov", "Find paid apprenticeships in the trades and more.", "Encuentra aprendizajes pagados en oficios y más.", "https://www.apprenticeship.gov/", ["trades"]),
  co("pe", "Fitness and sports basics (Khan Academy)", "Learn how exercise and the body work.", "Aprende cómo funcionan el ejercicio y el cuerpo.", "https://www.khanacademy.org/science/health-and-medicine", ["sports"]),
];

/* ---------- Proverbs ---------- */
export const QUOTES: { text: L; by: L }[] = [
  { text: l("Little by little, you go far.", "Poco a poco se va lejos."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Where there is a will, there is a way.", "Querer es poder."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Whoever keeps going gets there.", "El que persevera alcanza."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Better late than never.", "Más vale tarde que nunca."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Every cloud has a silver lining.", "No hay mal que por bien no venga."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Nothing ventured, nothing gained.", "El que no arriesga no gana."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("What is learned well is never forgotten.", "Lo que bien se aprende, nunca se olvida."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Grain by grain, the hen fills her belly.", "De grano en grano llena la gallina el buche."), by: l("Spanish proverb: small steps add up", "Dicho popular: los pasos pequeños suman") },
  { text: l("Nobody is born knowing.", "Nadie nace sabiendo."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Knowledge takes up no space.", "El saber no ocupa lugar."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("You reap what you sow.", "Lo que se siembra, se cosecha."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("If you want something good, it has to cost you some effort.", "El que quiere celeste, que le cueste."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Skill beats strength.", "Más vale maña que fuerza."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("After the storm comes calm.", "Después de la tormenta viene la calma."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("Practice makes the master.", "La práctica hace al maestro."), by: l("Spanish proverb", "Dicho popular") },
  { text: l("A journey of a thousand miles begins with a single step.", "Un viaje de mil millas comienza con un solo paso."), by: l("Lao Tzu", "Lao Tse") },
  { text: l("Learn a new language and get a new soul.", "Aprende un idioma nuevo y ganarás una nueva alma."), by: l("Czech proverb", "Proverbio checo") },
  { text: l("Every expert was once a beginner.", "Todo experto fue alguna vez un principiante."), by: l("Common saying", "Dicho común") },
  { text: l("Mistakes are proof that you are trying.", "Los errores son prueba de que lo estás intentando."), by: l("Common saying", "Dicho común") },
  { text: l("You do not have to be perfect to be great.", "No tienes que ser perfecto para ser excelente."), by: l("Common saying", "Dicho común") },
  { text: l("Start where you are. Use what you have. Do what you can.", "Empieza donde estás. Usa lo que tienes. Haz lo que puedas."), by: l("Common saying", "Dicho común") },
  { text: l("Small habits, done every day, build big futures.", "Los hábitos pequeños, hechos cada día, construyen grandes futuros."), by: l("Common saying", "Dicho común") },
];

/* ---------- Seasonal ideas: what to look for in each month ---------- */
export interface Season { items: { title: L; why: L; q: string }[] }
const s = (a: [string, string, string, string, string], b: [string, string, string, string, string], c3: [string, string, string, string, string]): Season =>
  ({ items: [a, b, c3].map(([tEn, tEs, wEn, wEs, qq]) => ({ title: l(tEn, tEs), why: l(wEn, wEs), q: qq })) });
export const SEASONS: Season[] = [
  s(["Summer programs", "Programas de verano", "Many summer programs open applications now and close in February or March.", "Muchos programas de verano abren solicitudes ahora y cierran en febrero o marzo.", "summer programs for high school students application deadline"], ["Scholarships", "Becas", "Senior scholarship deadlines start to arrive.", "Empiezan a llegar las fechas límite de becas para los de último año.", "scholarships for high school seniors"], ["Spring volunteering", "Voluntariado de primavera", "Plan ahead for spring service projects.", "Planea los proyectos de servicio de primavera.", "volunteer opportunities for teens"]),
  s(["Summer internships", "Prácticas de verano", "Apply early for the best internships and camps.", "Solicita temprano para las mejores prácticas y campamentos.", "summer internships for high school students"], ["Science fairs and contests", "Ferias de ciencias y concursos", "Many regional contests run in February and March.", "Muchos concursos regionales se hacen en febrero y marzo.", "science fair and academic competitions for students"], ["Dual enrollment", "Inscripción doble", "Sign-up for fall classes often starts in spring.", "La inscripción para las clases de otoño suele empezar en primavera.", "dual enrollment high school students"]),
  s(["Summer camps", "Campamentos de verano", "Spots fill up. Look now, and ask about scholarships.", "Los lugares se llenan. Busca ahora y pregunta por becas.", "summer camps for teens scholarships"], ["Summer jobs", "Trabajos de verano", "Businesses start hiring teens in spring.", "Los negocios empiezan a contratar jóvenes en primavera.", "summer jobs for teens"], ["Spring break programs", "Programas de las vacaciones de primavera", "Short programs and workshops during break.", "Programas cortos y talleres durante las vacaciones.", "spring break programs for students"]),
  s(["Summer volunteering", "Voluntariado de verano", "Plan hours to log over the summer.", "Planea horas para acumular durante el verano.", "summer volunteer opportunities for students"], ["AP exam season", "Temporada de exámenes AP", "AP exams are in May. Review plans and free help.", "Los exámenes AP son en mayo. Revisa planes y ayuda gratis.", "free AP exam review"], ["Camps and clinics", "Campamentos y clínicas", "Sports and arts clinics for the summer.", "Clínicas deportivas y de arte para el verano.", "sports and arts camps for kids and teens"]),
  s(["Summer jobs and internships", "Trabajos y prácticas de verano", "Last chance for many summer positions.", "Última oportunidad para muchos puestos de verano.", "summer jobs hiring teens"], ["Free summer meals and programs", "Comidas y programas gratis de verano", "Many places offer free programs for students.", "Muchos lugares ofrecen programas gratis para estudiantes.", "free summer programs for students"], ["End-of-year awards", "Premios de fin de año", "Write down your accomplishments before summer.", "Anota tus logros antes del verano.", "student awards and recognition programs"]),
  s(["Summer camps and classes", "Campamentos y clases de verano", "Programs are running now.", "Los programas están en marcha ahora.", "summer classes and camps for teens"], ["Volunteer hours", "Horas de voluntariado", "Summer is a good time to log service hours.", "El verano es buen momento para acumular horas de servicio.", "volunteer opportunities for teens"], ["Learn a skill", "Aprende una habilidad", "Use free time for coding, art, a language or a sport.", "Usa el tiempo libre para programación, arte, un idioma o un deporte.", "free online classes for teens"]),
  s(["Back-to-school help", "Ayuda para regresar a clases", "Supply and backpack drives start now.", "Empiezan las colectas de útiles y mochilas.", "back to school supplies free families"], ["Dual enrollment sign-up", "Inscripción doble", "Fall deadlines come quickly.", "Las fechas límite de otoño llegan rápido.", "dual enrollment sign up"], ["Clubs and sports", "Clubes y deportes", "Look for tryouts and club sign-ups.", "Busca pruebas de equipos e inscripciones de clubes.", "student clubs and sports tryouts"]),
  s(["Clubs, teams and tryouts", "Clubes, equipos y pruebas", "New school year sign-ups.", "Inscripciones del nuevo año escolar.", "teen clubs and teams near me"], ["Tutoring and study help", "Tutorías y ayuda para estudiar", "Start strong with free tutoring.", "Empieza bien con tutorías gratis.", "free tutoring for students"], ["College visits", "Visitas a universidades", "Many colleges host tours and open houses in the fall.", "Muchas universidades tienen recorridos y casas abiertas en el otoño.", "college tours and open house for high school students"]),
  s(["PSAT and SAT dates", "Fechas del PSAT y SAT", "Register early and ask about fee waivers.", "Regístrate temprano y pregunta por exenciones de cuotas.", "SAT PSAT registration fee waiver"], ["Scholarships", "Becas", "Fall is a big season for scholarship deadlines.", "El otoño es temporada grande de fechas límite de becas.", "scholarships for students fall deadlines"], ["Fall volunteering", "Voluntariado de otoño", "Food drives and community events begin.", "Empiezan las colectas de comida y los eventos comunitarios.", "volunteer opportunities fall teens"]),
  s(["FAFSA and college applications", "FAFSA y solicitudes a universidades", "Seniors: the FAFSA opens in the fall and college deadlines are coming.", "Último año: la FAFSA abre en el otoño y se acercan las fechas límite.", "FAFSA help workshop for students"], ["Scholarships", "Becas", "Apply to as many as you can.", "Solicita a todas las que puedas.", "scholarships for college seniors"], ["College visits", "Visitas a universidades", "Tour campuses before application deadlines.", "Visita campus antes de las fechas límite.", "college visit days"]),
  s(["Food drives and service", "Colectas de comida y servicio", "Many groups need volunteers now.", "Muchos grupos necesitan voluntarios ahora.", "food bank volunteer teens"], ["Scholarship deadlines", "Fechas límite de becas", "Many close in November and December.", "Muchas cierran en noviembre y diciembre.", "scholarship deadlines this month"], ["Winter break plans", "Planes para las vacaciones de invierno", "Look for programs and jobs over break.", "Busca programas y trabajos durante las vacaciones.", "winter break programs for teens"]),
  s(["Winter break programs", "Programas de invierno", "Short workshops, volunteer days and seasonal jobs.", "Talleres cortos, días de voluntariado y trabajos de temporada.", "winter break activities for teens"], ["College application deadlines", "Fechas límite de solicitudes", "Many are due in January. Double-check yours.", "Muchas vencen en enero. Revisa las tuyas.", "college application deadlines January"], ["Plan next semester", "Planea el próximo semestre", "Set goals and find new opportunities.", "Fija metas y busca nuevas oportunidades.", "opportunities for students new semester"]),
];
