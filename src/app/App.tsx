import { useState, useEffect } from "react";
import {
  Brain, BookOpen, Users, Music, Eye, Activity, UserRound,
  ChevronRight, Check, X, HelpCircle, LockKeyhole, LogOut,
  Star, BarChart2, Calendar, Clock, Search, House,
  ArrowLeft, AlertCircle, Calculator, Headphones, Hand,
  LayoutDashboard, BookText, Info, CircleCheckBig,
  type LucideProps
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "home"
  | "mi-name" | "mi-test" | "mi-analyzing" | "mi-results"
  | "ls-name" | "ls-test" | "ls-analyzing" | "ls-results"
  | "admin-login" | "admin-dashboard";

type MIAnswer = "V" | "F" | "";
type IconFC = React.FC<LucideProps>;

interface MIRecord {
  id: string; type: "mi"; name: string; date: string; time: string;
  answers: MIAnswer[]; scores: Record<string, number>; dominant: string[];
}
interface LSRecord {
  id: string; type: "ls"; name: string; date: string; time: string;
  answers: number[]; scores: Record<string, number>; dominant: string[];
}
type TestRecord = MIRecord | LSRecord;

// ─── Exact questions from PDF ─────────────────────────────────────────────────

const MI_QUESTIONS: string[] = [
  "Prefiero hacer un mapa que explicarle a alguien como tiene que llegar a un lugar determinado.",
  "Si estoy enojado o contento generalmente sé la razón exacta de por qué es así",
  "Sé tocar, o antes sabía, un instrumento musical.",
  "Asocio la música con mis estados de ánimo",
  "Puedo sumar o multiplicar mentalmente con mucha rapidez",
  "Puedo ayudar a un amigo(a) a manejar y controlar sus sentimientos, porque yo lo pude hacer antes en relación a sentimientos parecidos",
  "Me gusta trabajar con calculadora y computadoras",
  "Aprendo rápidamente a bailar un baile nuevo",
  "No me es difícil decir lo que pienso durante una discusión o debate.",
  "¿Disfruto de una buena charla, prédica o sermón?",
  "Siempre distingo el Norte del Sur, esté donde esté.",
  "Me gusta reunir grupos de personas en una fiesta o evento especial.",
  "Realmente la vida me parece vacía sin música",
  "Siempre entiendo los gráficos que vienen en las instrucciones de equipos o instrumentos.",
  "Me gusta resolver puzzles y entretenerme con juegos electrónicos.",
  "Me fue fácil aprender a andar en bicicleta o patines",
  "Me enojo cuando escucho una discusión o una afirmación que me parece ilógica o absurda.",
  "Soy capaz de convencer a otros que sigan mis planes o ideas.",
  "Tengo buen sentido del equilibrio y de coordinación.",
  "A menudo puedo captar relaciones entre números con mayor rapidez y facilidad que algunos de mis compañeros.",
  "Me gusta construir modelos, maquetas o hacer esculturas.",
  "Soy bueno para encontrar el significado preciso de las palabras.",
  "Puedo mirar un objeto de una manera y con la misma facilidad verlo dado vuelta o al revés.",
  "Con frecuencia establezco la relación que puede haber entre una música o canción y algo que haya ocurrido en mi vida.",
  "Me gusta trabajar con números y figuras",
  "Me gusta sentarme muy callado y pensar, reflexionar sobre mis sentimientos más íntimos.",
  "Solamente con mirar las formas de las construcciones y estructuras me siento a gusto.",
  "Cuando estoy en la ducha, o cuando estoy solo me gusta tararear, cantar o silbar.",
  "Soy bueno para el atletismo",
  "Me gusta escribir cartas largas a mis amigos.",
  "Generalmente me doy cuenta de la expresión o gestos que tengo en la cara.",
  "Muchas veces me doy cuenta de las expresiones o gestos en la cara de las otras personas.",
  "Reconozco mis estados de ánimo, no me cuesta identificarlos.",
  "Me doy cuenta de los estados de ánimo de las personas con quienes me encuentro",
  "Me doy cuenta bastante bien de lo que los otros piensan de mí.",
];

// Hoja de Corrección exacta del PDF
const MI_KEY: Record<string, number[]> = {
  A: [9, 10, 17, 22, 30],
  B: [5, 7, 15, 20, 25],
  C: [1, 11, 14, 23, 27],
  D: [8, 16, 19, 21, 29],
  E: [3, 4, 13, 24, 28],
  F: [2, 6, 26, 31, 33],
  G: [12, 18, 32, 34, 35],
};

interface MIInfoItem {
  label: string; short: string; desc: string;
  color: string; bg: string; Icon: IconFC;
}
const MI_INFO: Record<string, MIInfoItem> = {
  A: { label: "Verbal / Lingüística",   short: "Verbal",   Icon: BookText,   color: "#6C63FF", bg: "#EDE9FE", desc: "Comprende la capacidad de emplear efectivamente las palabras ya sea en forma oral y escrita. La utilizamos cuando hablamos en conversaciones, ponemos pensamientos por escrito o escribimos cartas." },
  B: { label: "Lógica / Matemática",    short: "Lógica",   Icon: Calculator, color: "#3B82F6", bg: "#DBEAFE", desc: "Consiste en la capacidad para utilizar los números en forma efectiva y para razonar en forma lógica. Está asociada con el pensamiento científico y la búsqueda de patrones." },
  C: { label: "Visual / Espacial",      short: "Visual",   Icon: Eye,        color: "#8B5CF6", bg: "#EDE9FE", desc: "Consiste en la capacidad de percibir el mundo visual espacial adecuadamente. Nos permite visualizar las cosas, formarse modelos mentales y maniobrar usando esos modelos." },
  D: { label: "Corporal / Cinestésica", short: "Corporal", Icon: Activity,   color: "#10B981", bg: "#D1FAE5", desc: "Se encuentra en la capacidad para utilizar el cuerpo entero en expresar ideas y sentimientos. Es la capacidad para resolver problemas empleando el cuerpo o parte del mismo." },
  E: { label: "Musical / Rítmica",      short: "Musical",  Icon: Music,      color: "#F59E0B", bg: "#FEF3C7", desc: "Es la capacidad para percibir, discriminar, transformar y expresar a través de formas musicales. Implica el aprecio por la música, el canto y el tocar un instrumento." },
  F: { label: "Intrapersonal",          short: "Intra",    Icon: UserRound,  color: "#EF4444", bg: "#FEE2E2", desc: "Es la capacidad para comprenderse a uno mismo y para actuar en forma autorreflexiva. Involucra el conocimiento de los sentimientos, el proceso pensante y la intuición." },
  G: { label: "Interpersonal",          short: "Inter",    Icon: Users,      color: "#06B6D4", bg: "#CFFAFE", desc: "Es la capacidad de captar y evaluar en forma rápida los estados de ánimo, intenciones y sentimientos de los demás. Permite desarrollar empatía y mantener la identidad individual." },
};

const LS_QUESTIONS: string[] = [
  "Puedo recordar algo mejor si lo escribo",
  "Al leer, oigo las palabras en mi cabeza o las leo en voz alta",
  "Necesito hablar las cosas para entenderlas mejor",
  "No me gusta leer o escuchar instrucciones, prefiero simplemente comenzar a hacer las cosas",
  "Puedo visualizar imágenes en mi cabeza",
  "Puedo estudiar mejor si escucho música",
  "Necesito recesos frecuentemente cuando estudio",
  "Pienso mejor cuando tengo la libertad de moverme, estar sentado detrás de un escritorio no es para mi",
  "Tomo muchas notas de lo que leo y escucho",
  "Me ayuda mirar a la persona que esta hablando. Me mantiene enfocado",
  "Se me hace difícil entender lo que una persona esta diciendo si hay ruido alrededor",
  "Prefiero que alguien me diga como tengo que hacer las cosas que leer las instrucciones",
  "Prefiero escuchar una conferencia o una grabación que leer un libro",
  'Cuando no puedo pensar en una palabra específica, uso mis manos y llamo al objeto "esa cosa"',
  "Puedo seguir fácilmente a una persona que esta hablando, aunque mi cabeza este hacia abajo o me encuentre mirando por la ventana",
  "Es más fácil para mi hacer un trabajo en un lugar tranquilo",
  "Me resulta fácil entender mapas, tablas y gráficos",
  "Cuando comienzo un artículo o un libro, prefiero espiar la última página",
  "Recuerdo mejor lo que la gente dice que su aspecto",
  "Recuerdo mejor si estudio en voz alta con alguien",
  "Tomo notas, pero nunca vuelvo a releerlas",
  "Cuando estoy concentrado leyendo o escribiendo, la radio me molesta",
  "Me resulta difícil crear imágenes en mi cabeza",
  "Me resulta útil decir en voz alta las tareas que tengo que hacer",
  "Mi cuaderno y escritorio pueden verse un desastre, pero sé exactamente donde esta cada cosa",
  "Cuando estoy en un examen, puedo recordar con exactitud la página en el libro y la respuesta",
  "No puedo recordar un chiste lo suficiente para contarlo luego",
  "Al aprender algo nuevo, prefiero escuchar la información, luego leer y luego hacerlo",
  "Me gusta completar una tarea antes de hacer otra",
  "Uso mis dedos para contar y muevo los labios cuando leo",
  "No me gusta releer mi trabajo",
  "Cuando estoy tratando de recordar algo nuevo, por ejemplo, un número telefónico, me ayuda formarme una imagen mental para lograrlo",
  "Para obtener una nota extra, prefiero grabar un informe a escribirlo",
  "Fantaseo en clases",
  "Para obtener una calificación extra, prefiero crear un proyecto a escribir un informe",
  "Cuando tengo una gran idea, debo escribirla inmediatamente, o la olvido con facilidad",
];

// Tabla de resultados exacta del PDF (Lynn O'Brien)
const LS_KEY: Record<string, number[]> = {
  visual:      [1, 5, 9, 10, 11, 16, 17, 22, 26, 27, 32, 36],
  auditivo:    [2, 3, 12, 13, 15, 19, 20, 23, 24, 28, 29, 33],
  kinestesico: [4, 6, 7, 8, 14, 18, 21, 25, 30, 31, 34, 35],
};

// Escala exacta del PDF
const LS_SCALE = [
  { value: 1, label: "Casi nunca",     color: "#EF4444", bg: "#FEE2E2" },
  { value: 2, label: "Rara vez",       color: "#F97316", bg: "#FED7AA" },
  { value: 3, label: "A veces",        color: "#F59E0B", bg: "#FEF3C7" },
  { value: 4, label: "Frecuentemente", color: "#84CC16", bg: "#DCFCE7" },
  { value: 5, label: "Casi siempre",   color: "#10B981", bg: "#D1FAE5" },
];

interface LSInfoItem {
  label: string; desc: string; color: string; bg: string; Icon: IconFC;
}
const LS_INFO: Record<string, LSInfoItem> = {
  visual:      { label: "Visual",      Icon: Eye,        color: "#6C63FF", bg: "#EDE9FE", desc: "Aprendes mejor cuando la información se presenta de forma gráfica: imágenes, diagramas, mapas conceptuales y organizadores visuales son tus principales aliados." },
  auditivo:    { label: "Auditivo",    Icon: Headphones, color: "#3B82F6", bg: "#DBEAFE", desc: "Procesas mejor la información a través del sonido. Las explicaciones verbales, debates, grabaciones y la repetición oral son tus estrategias más efectivas." },
  kinestesico: { label: "Kinestésico", Icon: Hand,       color: "#10B981", bg: "#D1FAE5", desc: "Aprendes haciendo. Los proyectos prácticos, laboratorios, el movimiento y la experimentación directa son esenciales para fijar el conocimiento." },
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "neurotest_v3";
function saveRecord(r: TestRecord) {
  const all = getRecords(); all.push(r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
function getRecords(): TestRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function nowDate() { return new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }); }
function nowTime() { return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); }

// ─── Scoring (exact from PDF) ─────────────────────────────────────────────────

function scoreMI(answers: MIAnswer[]) {
  const scores: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
  Object.entries(MI_KEY).forEach(([k, qs]) => qs.forEach(n => { if (answers[n - 1] === "V") scores[k]++; }));
  const max = Math.max(...Object.values(scores));
  return { scores, dominant: Object.entries(scores).filter(([, v]) => v === max).map(([k]) => k) };
}
function scoreLS(answers: number[]) {
  const scores: Record<string, number> = { visual: 0, auditivo: 0, kinestesico: 0 };
  Object.entries(LS_KEY).forEach(([k, qs]) => qs.forEach(n => { if (answers[n - 1] >= 1) scores[k] += answers[n - 1]; }));
  const max = Math.max(...Object.values(scores));
  return { scores, dominant: Object.entries(scores).filter(([, v]) => v === max).map(([k]) => k) };
}

// ─── Shared components ────────────────────────────────────────────────────────

function ProgressBar({ value, max, color = "#6C63FF" }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.round((value / max) * 100)}%`, background: `linear-gradient(90deg, ${color}, #8B5CF6)` }} />
    </div>
  );
}

function PulsingBrain() {
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {[1, 2, 3].map(i => (
        <div key={i} className="absolute rounded-full border-2 animate-ping"
          style={{ width: `${i * 44}px`, height: `${i * 44}px`, borderColor: "#6C63FF", opacity: 0.12 / i, animationDelay: `${i * 0.35}s`, animationDuration: "2s" }} />
      ))}
      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
        style={{ background: "linear-gradient(135deg, #6C63FF, #8B5CF6)" }}>
        <Brain className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}

// Small icon badge used in result cards and table pills
function IconBadge({ Icon, label, color, bg }: { Icon: IconFC; label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {label}
    </span>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onMI, onLS, onAdmin }: { onMI: () => void; onLS: () => void; onAdmin: () => void }) {
  const cards = [
    {
      onClick: onMI,
      Icon: Brain,
      iconBg: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
      iconColor: "#6C63FF",
      title: "Test de Inteligencias Múltiples",
      subtitle: "Howard Gardner · 35 preguntas",
      tags: ["V / F / Blanco", "7 inteligencias"],
      tagStyle: { background: "#EDE9FE", color: "#6C63FF" },
      shadow: "0 4px 24px rgba(108,99,255,0.10)",
    },
    {
      onClick: onLS,
      Icon: BookOpen,
      iconBg: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
      iconColor: "#3B82F6",
      title: "Test de Estilos de Aprendizaje",
      subtitle: "Lynn O'Brien · 36 preguntas",
      tags: ["Escala 1–5", "3 estilos"],
      tagStyle: { background: "#DBEAFE", color: "#3B82F6" },
      shadow: "0 4px 24px rgba(59,130,246,0.10)",
    },
    {
      onClick: onAdmin,
      Icon: LayoutDashboard,
      iconBg: "#F1F5F9",
      iconColor: "#64748B",
      title: "Panel Administrador",
      subtitle: "Resultados y estadísticas generales",
      tags: ["Acceso restringido"],
      tagStyle: { background: "#F1F5F9", color: "#64748B" },
      shadow: "0 4px 24px rgba(0,0,0,0.04)",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="px-6 pt-12 pb-8 text-center"
        style={{ background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)" }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #6C63FF, #8B5CF6)" }}>
            <Brain className="w-7 h-7 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-3xl font-bold text-white tracking-tight">Neuro</span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: "#A78BFA" }}>Test</span>
          </div>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">
          Descubre tu inteligencia predominante y tu<br />estilo de aprendizaje
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 px-5 py-6 space-y-4 max-w-sm mx-auto w-full">
        {cards.map(({ onClick, Icon, iconBg, iconColor, title, subtitle, tags, tagStyle, shadow }) => (
          <button key={title} onClick={onClick}
            className="w-full text-left bg-card rounded-3xl p-6 border border-border active:scale-95 transition-all"
            style={{ boxShadow: shadow }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg }}>
                <Icon className="w-7 h-7" style={{ color: iconColor }} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-base leading-snug">{title}</h3>
                <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full font-medium" style={tagStyle}>{t}</span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.75} />
            </div>
          </button>
        ))}
      </div>

      {/* Credits */}
      <div className="pb-8 text-center">
        <p className="text-muted-foreground text-xs">
          Créditos de la página: <span className="font-semibold text-foreground">Kesly L</span>
        </p>
      </div>
    </div>
  );
}

// ─── Name Input Screen ────────────────────────────────────────────────────────

function NameScreen({ title, subtitle, onNext, onBack }: {
  title: string; subtitle: string; onNext: (name: string) => void; onBack: () => void;
}) {
  const [name, setName] = useState("");
  const valid = name.trim().length >= 2;
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="px-6 pt-10 pb-4">
        <button onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} /> Volver
        </button>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6C63FF, #8B5CF6)" }}>
            <Brain className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          <span className="font-bold text-foreground text-sm">NeuroTest</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mt-4">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>

      <div className="flex-1 px-6 pt-2">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <label className="block text-sm font-semibold text-foreground mb-3">Nombre completo</label>
          <input
            type="text" autoFocus value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && valid) onNext(name.trim()); }}
            placeholder="Ej. María Fernández García"
            className="w-full px-4 py-4 rounded-2xl text-foreground text-base outline-none border-2 transition-all"
            style={{ background: "#F8FAFC", borderColor: name.length > 0 ? "#6C63FF" : "rgba(108,99,255,0.15)", fontFamily: "inherit" }}
          />
          {name.length > 0 && !valid && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#EF4444" }}>
              <AlertCircle className="w-3 h-3" /> Ingresa al menos 2 caracteres
            </p>
          )}
        </div>
        <div className="mt-4 p-4 rounded-2xl flex items-start gap-3" style={{ background: "#F1F5F9" }}>
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Solo solicitamos tu nombre completo. No se pide ningún otro dato personal.
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button onClick={() => valid && onNext(name.trim())} disabled={!valid}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #6C63FF, #8B5CF6)" }}>
          Iniciar cuestionario
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── MI Test Screen ───────────────────────────────────────────────────────────

function MITestScreen({ onComplete }: { onComplete: (a: MIAnswer[]) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<MIAnswer[]>([]);
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState<MIAnswer | null>(null);

  function handle(value: MIAnswer) {
    if (selected !== null) return;
    setSelected(value);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        const next = [...answers, value];
        setAnswers(next); setSelected(null);
        if (current < MI_QUESTIONS.length - 1) { setCurrent(c => c + 1); setVisible(true); }
        else onComplete(next);
      }, 220);
    }, 380);
  }

  const q = MI_QUESTIONS[current];
  const transition = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "all 0.22s ease" };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="px-6 pt-10 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Test de Inteligencias Múltiples</p>
            <p className="text-xs font-bold" style={{ color: "#6C63FF" }}>Howard Gardner</p>
          </div>
          <span className="font-bold text-sm text-foreground">{current + 1} / {MI_QUESTIONS.length}</span>
        </div>
        <ProgressBar value={current + 1} max={MI_QUESTIONS.length} />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 pb-4 gap-5">
        {/* Question card */}
        <div className="bg-card rounded-3xl p-6 shadow-md border border-border" style={transition}>
          <span className="text-xs font-bold px-2 py-1 rounded-lg inline-block mb-3"
            style={{ background: "#EDE9FE", color: "#6C63FF" }}>
            #{current + 1}
          </span>
          <p className="text-foreground font-semibold text-base leading-relaxed">{q}</p>
        </div>

        {/* Answer buttons */}
        <div className="space-y-3" style={{ ...transition, transitionDelay: "0.04s" }}>
          <p className="text-xs text-muted-foreground text-center font-medium">Selecciona tu respuesta</p>

          {[
            { value: "V" as MIAnswer, label: "Verdadero", sublabel: "Refleja una característica mía", Icon: Check, selBg: "#D1FAE5", selBorder: "#6EE7B7", selText: "#065F46", iconBg: "#D1FAE5", iconColor: "#10B981" },
            { value: "F" as MIAnswer, label: "Falso",      sublabel: "No refleja una característica mía", Icon: X,     selBg: "#FEE2E2", selBorder: "#FCA5A5", selText: "#7F1D1D", iconBg: "#FEE2E2", iconColor: "#EF4444" },
            { value: "" as MIAnswer,  label: "En blanco",  sublabel: "A veces sí, a veces no",            Icon: HelpCircle, selBg: "#FEF3C7", selBorder: "#FCD34D", selText: "#78350F", iconBg: "#FEF3C7", iconColor: "#F59E0B" },
          ].map(({ value, label, sublabel, Icon, selBg, selBorder, selText, iconBg, iconColor }) => (
            <button key={label} onClick={() => handle(value)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all active:scale-95"
              style={{
                background: selected === value ? selBg : "#fff",
                borderColor: selected === value ? selBorder : "rgba(0,0,0,0.08)",
                color: selected === value ? selText : "#374151",
              }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={2} />
              </span>
              <div className="text-left">
                <p className="font-bold text-sm">{value === "V" ? "V — " : value === "F" ? "F — " : ""}{label}</p>
                <p className="text-xs opacity-60 font-normal mt-0.5">{sublabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="pb-6 text-center text-muted-foreground text-xs px-6">
        Responde con honestidad · No hay respuestas correctas o incorrectas
      </p>
    </div>
  );
}

// ─── LS Test Screen ───────────────────────────────────────────────────────────

function LSTestScreen({ onComplete }: { onComplete: (a: number[]) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  function handle(value: number) {
    if (selected !== null) return;
    setSelected(value);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        const next = [...answers, value];
        setAnswers(next); setSelected(null);
        if (current < LS_QUESTIONS.length - 1) { setCurrent(c => c + 1); setVisible(true); }
        else onComplete(next);
      }, 220);
    }, 380);
  }

  const q = LS_QUESTIONS[current];
  const transition = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "all 0.22s ease" };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="px-6 pt-10 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Test de Estilos de Aprendizaje</p>
            <p className="text-xs font-bold" style={{ color: "#3B82F6" }}>Lynn O'Brien</p>
          </div>
          <span className="font-bold text-sm text-foreground">{current + 1} / {LS_QUESTIONS.length}</span>
        </div>
        <ProgressBar value={current + 1} max={LS_QUESTIONS.length} color="#3B82F6" />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 pb-4 gap-5">
        <div className="bg-card rounded-3xl p-6 shadow-md border border-border" style={transition}>
          <span className="text-xs font-bold px-2 py-1 rounded-lg inline-block mb-3"
            style={{ background: "#DBEAFE", color: "#3B82F6" }}>#{current + 1}</span>
          <p className="text-foreground font-semibold text-base leading-relaxed mt-1">{q}</p>
        </div>

        <div style={{ ...transition, transitionDelay: "0.04s" }}>
          <p className="text-xs text-muted-foreground text-center font-medium mb-3">
            ¿Con qué frecuencia te ocurre esto?
          </p>
          <div className="grid grid-cols-5 gap-2">
            {LS_SCALE.map(opt => (
              <button key={opt.value} onClick={() => handle(opt.value)}
                className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl border-2 transition-all active:scale-95"
                style={{
                  background: selected === opt.value ? opt.bg : "#fff",
                  borderColor: selected === opt.value ? opt.color : "rgba(0,0,0,0.08)",
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: opt.bg, color: opt.color }}>{opt.value}</div>
                <span className="text-center leading-tight font-medium"
                  style={{ fontSize: "10px", color: selected === opt.value ? opt.color : "#6B7280" }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs text-muted-foreground">Casi nunca</span>
            <span className="text-xs text-muted-foreground">Casi siempre</span>
          </div>
        </div>
      </div>

      <p className="pb-6 text-center text-muted-foreground text-xs px-6">
        Selecciona la frecuencia que mejor te describe
      </p>
    </div>
  );
}

// ─── Analyzing Screen ─────────────────────────────────────────────────────────

function AnalyzingScreen({ text, onDone }: { text: string; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = ["Procesando respuestas...", "Aplicando algoritmo oficial...", "Calculando puntajes...", "Generando tu perfil..."];

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(iv); setTimeout(onDone, 500); return 100; } return p + 1.6; });
    }, 40);
    return () => clearInterval(iv);
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => Math.min(p + 1, phases.length - 1)), 900);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center max-w-md mx-auto"
      style={{ background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)" }}>
      <div className="mb-8"><PulsingBrain /></div>
      <h2 className="text-2xl font-bold text-white mb-2">{text}</h2>
      <p className="text-white/60 text-sm mb-8 h-5">{phases[phase]}</p>
      <div className="w-full max-w-xs">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%`, background: "linear-gradient(90deg, #6C63FF, #8B5CF6, #3B82F6)" }} />
        </div>
        <p className="text-white/40 text-xs">{Math.min(Math.round(progress), 100)}% completado</p>
      </div>
    </div>
  );
}

// ─── MI Results Screen ────────────────────────────────────────────────────────

function MIResultsScreen({ record, onHome }: { record: MIRecord; onHome: () => void }) {
  const { scores, dominant, name } = record;
  const domInfo = MI_INFO[dominant[0]];
  const highlighted = Object.entries(scores).filter(([, v]) => v >= 4).map(([k]) => k);

  const radarData = Object.entries(scores).map(([k, v]) => ({
    subject: MI_INFO[k].short, puntaje: v, fullMark: 5,
  }));

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      {/* Hero */}
      <div className="px-6 pt-10 pb-6 text-center"
        style={{ background: `linear-gradient(160deg, ${domInfo.color}18, #F8FAFC 100%)` }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ background: domInfo.bg, color: domInfo.color }}>
          <Star className="w-3 h-3" strokeWidth={2} />
          {dominant.length === 1 ? "Tu inteligencia predominante" : "Tus inteligencias predominantes"}
        </div>

        {dominant.map(d => {
          const DomIcon = MI_INFO[d].Icon;
          return (
            <div key={d} className="mb-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${MI_INFO[d].color}, #8B5CF6)` }}>
                <DomIcon className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{MI_INFO[d].label}</h2>
              {dominant.length > 1 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: MI_INFO[d].bg, color: MI_INFO[d].color }}>Empate</span>
              )}
            </div>
          );
        })}
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{domInfo.desc}</p>
        <p className="text-xs mt-3 font-medium text-muted-foreground">
          Resultados de: <span className="text-foreground font-bold">{name}</span>
        </p>
      </div>

      {/* Radar chart */}
      <div className="px-6 mb-5">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
          <p className="font-semibold text-foreground text-sm mb-1">Perfil de las 7 Inteligencias</p>
          <p className="text-xs text-muted-foreground mb-3">Puntaje máximo: 5 por inteligencia</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="rgba(108,99,255,0.12)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B", fontFamily: "Poppins" }} />
              <PolarRadiusAxis domain={[0, 5]} tickCount={4} tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} />
              <Radar name="Puntaje" dataKey="puntaje" stroke={domInfo.color} fill={domInfo.color} fillOpacity={0.15} strokeWidth={2.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="px-6 mb-5">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
          <p className="font-semibold text-foreground text-sm mb-1">Puntajes obtenidos</p>
          <p className="text-xs text-muted-foreground mb-4">
            ≥ 4 puntos = habilidad destacada (según la hoja de corrección)
          </p>
          <div className="space-y-3.5">
            {(Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
              const info = MI_INFO[k];
              const ItemIcon = info.Icon;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: info.bg }}>
                        <ItemIcon className="w-3.5 h-3.5" style={{ color: info.color }} strokeWidth={2} />
                      </span>
                      <span className="text-sm font-medium text-foreground">{info.label}</span>
                      {dominant.includes(k) && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: info.bg, color: info.color }}>
                          {dominant.length > 1 ? "Empate" : "Predominante"}
                        </span>
                      )}
                      {v >= 4 && !dominant.includes(k) && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#FEF3C7", color: "#D97706" }}>Destacada</span>
                      )}
                    </div>
                    <span className="text-sm font-bold" style={{ color: info.color }}>{v} / 5</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(v / 5) * 100}%`, background: info.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="px-6 mb-5">
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "#F1F5F9" }}>
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Según la hoja de corrección de Howard Gardner, un puntaje de 4 o más en cualquier categoría indica que allí tienes una habilidad que resalta.
          </p>
        </div>
      </div>

      <div className="px-6">
        <button onClick={onHome}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #6C63FF, #8B5CF6)" }}>
          <House className="w-5 h-5" strokeWidth={1.75} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── LS Results Screen ────────────────────────────────────────────────────────

function LSResultsScreen({ record, onHome }: { record: LSRecord; onHome: () => void }) {
  const { scores, dominant, name } = record;
  const domInfo = LS_INFO[dominant[0]];
  const maxScore = 60;

  const pieData = Object.entries(scores).map(([k, v]) => ({
    name: LS_INFO[k].label, value: v, color: LS_INFO[k].color,
  }));

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-6 pt-10 pb-6 text-center"
        style={{ background: `linear-gradient(160deg, ${domInfo.color}18, #F8FAFC 100%)` }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ background: domInfo.bg, color: domInfo.color }}>
          <Star className="w-3 h-3" strokeWidth={2} />
          {dominant.length === 1 ? "Tu estilo predominante" : "Tus estilos predominantes"}
        </div>

        {dominant.map(d => {
          const DomIcon = LS_INFO[d].Icon;
          return (
            <div key={d} className="mb-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${LS_INFO[d].color}, #8B5CF6)` }}>
                <DomIcon className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{LS_INFO[d].label}</h2>
              {dominant.length > 1 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: LS_INFO[d].bg, color: LS_INFO[d].color }}>Empate</span>
              )}
            </div>
          );
        })}
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{domInfo.desc}</p>
        <p className="text-xs mt-3 font-medium text-muted-foreground">
          Resultados de: <span className="text-foreground font-bold">{name}</span>
        </p>
      </div>

      {/* Chart + bars */}
      <div className="px-6 mb-5">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
          <p className="font-semibold text-foreground text-sm mb-1">Puntajes por estilo</p>
          <p className="text-xs text-muted-foreground mb-4">Máximo: 60 por estilo (12 preguntas × 5)</p>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="45%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Poppins", fontSize: 11, borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
                const info = LS_INFO[k];
                const BarIcon = info.Icon;
                return (
                  <div key={k}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <BarIcon className="w-3.5 h-3.5" style={{ color: info.color }} strokeWidth={2} />
                        <span className="font-medium text-foreground">{info.label}</span>
                        {dominant.includes(k) && (
                          <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: info.color }}>
                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="font-bold" style={{ color: info.color }}>{v}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(v / maxScore) * 100}%`, background: info.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-3 justify-center flex-wrap">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="px-6 mb-5">
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "#F1F5F9" }}>
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Según la tabla de Lynn O'Brien, el canal con más puntaje es tu estilo predominante. Cada estilo es la suma de 12 preguntas en escala 1–5.
          </p>
        </div>
      </div>

      <div className="px-6">
        <button onClick={onHome}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}>
          <House className="w-5 h-5" strokeWidth={1.75} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── Admin Login Screen ───────────────────────────────────────────────────────

function AdminLoginScreen({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    if (pw === "Admin3") { onSuccess(); }
    else {
      setError(true); setShake(true); setPw("");
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-md mx-auto relative">
      <button onClick={onBack}
        className="absolute top-10 left-6 flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} /> Volver
      </button>

      <div className="w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)" }}>
            <LockKeyhole className="w-8 h-8 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Panel Administrador</h1>
          <p className="text-muted-foreground text-sm mt-2">Ingresa la contraseña para acceder</p>
        </div>

        <div className={`bg-card rounded-3xl p-6 shadow-md border transition-all ${shake ? "border-red-300" : "border-border"}`}
          style={shake ? { animation: "shake 0.5s ease" } : {}}>
          <label className="block text-sm font-semibold text-foreground mb-3">Contraseña</label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <input type="password" autoFocus value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-foreground text-base outline-none border-2 transition-all"
              style={{ background: "#F8FAFC", borderColor: error ? "#EF4444" : pw.length > 0 ? "#6C63FF" : "rgba(108,99,255,0.15)", fontFamily: "inherit" }}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-sm font-medium" style={{ color: "#EF4444" }}>
              <AlertCircle className="w-4 h-4" />
              Contraseña incorrecta. Inténtalo de nuevo.
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={pw.length === 0}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)" }}>
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
          Acceder al panel
        </button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ─── Student Detail Modal ─────────────────────────────────────────────────────

function StudentDetail({ record, onClose }: { record: TestRecord; onClose: () => void }) {
  const isMI = record.type === "mi";

  if (isMI) {
    const { scores, dominant, answers, name, date, time } = record as MIRecord;
    const radarData = Object.entries(scores).map(([k, v]) => ({ subject: MI_INFO[k].short, puntaje: v, fullMark: 5 }));
    const DomIcon0 = MI_INFO[dominant[0]].Icon;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}>
        <div className="bg-background w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto"
          onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-background px-6 pt-6 pb-3 border-b border-border z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Brain className="w-3.5 h-3.5" style={{ color: "#6C63FF" }} strokeWidth={2} />
                  <p className="text-xs font-semibold" style={{ color: "#6C63FF" }}>Test de Inteligencias Múltiples</p>
                </div>
                <h3 className="font-bold text-foreground text-lg">{name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" strokeWidth={1.75} />{date}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" strokeWidth={1.75} />{time}
                  </span>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 flex-shrink-0">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Dominant */}
            <div className="p-4 rounded-2xl" style={{ background: MI_INFO[dominant[0]].bg }}>
              <p className="text-xs font-semibold mb-3" style={{ color: MI_INFO[dominant[0]].color }}>
                {dominant.length === 1 ? "Inteligencia Predominante" : "Inteligencias Predominantes (Empate)"}
              </p>
              {dominant.map(d => {
                const DIcon = MI_INFO[d].Icon;
                return (
                  <div key={d} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${MI_INFO[d].color}, #8B5CF6)` }}>
                      <DIcon className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                    <span className="font-bold text-foreground">{MI_INFO[d].label}</span>
                  </div>
                );
              })}
            </div>

            {/* Radar */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs font-semibold text-foreground mb-3">Perfil de Inteligencias</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <PolarGrid stroke="rgba(108,99,255,0.12)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748B", fontFamily: "Poppins" }} />
                  <PolarRadiusAxis domain={[0, 5]} tickCount={4} tick={false} axisLine={false} />
                  <Radar dataKey="puntaje" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Scores */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Puntajes por inteligencia</p>
              </div>
              {(Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
                const info = MI_INFO[k];
                const RowIcon = info.Icon;
                return (
                  <div key={k} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: info.bg }}>
                      <RowIcon className="w-4 h-4" style={{ color: info.color }} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{info.label}</p>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(v / 5) * 100}%`, background: info.color }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color: info.color }}>{v}/5</span>
                      {v >= 4 && <p className="text-xs" style={{ color: "#D97706" }}>Destacada</p>}
                      {dominant.includes(k) && <p className="text-xs font-bold" style={{ color: info.color }}>Predom.</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Answers summary */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs font-semibold text-foreground mb-3">Resumen de respuestas (35 preguntas)</p>
              <div className="flex gap-3">
                {[
                  { label: "Verdadero", count: answers.filter(a => a === "V").length, Icon: Check, color: "#10B981", bg: "#D1FAE5" },
                  { label: "Falso",     count: answers.filter(a => a === "F").length, Icon: X,     color: "#EF4444", bg: "#FEE2E2" },
                  { label: "En blanco", count: answers.filter(a => a === "").length, Icon: HelpCircle, color: "#F59E0B", bg: "#FEF3C7" },
                ].map(item => (
                  <div key={item.label} className="flex-1 text-center p-3 rounded-xl" style={{ background: item.bg }}>
                    <item.Icon className="w-4 h-4 mx-auto mb-1" style={{ color: item.color }} strokeWidth={2} />
                    <p className="text-xl font-bold" style={{ color: item.color }}>{item.count}</p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: item.color }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LS Detail ───
  const { scores, dominant, answers, name, date, time } = record as LSRecord;
  const maxScore = 60;
  const barData = Object.entries(scores).map(([k, v]) => ({ name: LS_INFO[k].label, puntaje: v, fill: LS_INFO[k].color }));
  const lsScaleCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (answers as number[]).forEach(a => { if (a >= 1 && a <= 5) lsScaleCount[a]++; });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="bg-background w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background px-6 pt-6 pb-3 border-b border-border z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} strokeWidth={2} />
                <p className="text-xs font-semibold" style={{ color: "#3B82F6" }}>Test de Estilos de Aprendizaje</p>
              </div>
              <h3 className="font-bold text-foreground text-lg">{name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" strokeWidth={1.75} />{date}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" strokeWidth={1.75} />{time}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted text-muted-foreground flex-shrink-0">
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Dominant */}
          <div className="p-4 rounded-2xl" style={{ background: LS_INFO[dominant[0]].bg }}>
            <p className="text-xs font-semibold mb-3" style={{ color: LS_INFO[dominant[0]].color }}>
              {dominant.length === 1 ? "Estilo Predominante" : "Estilos Predominantes (Empate)"}
            </p>
            {dominant.map(d => {
              const DIcon = LS_INFO[d].Icon;
              return (
                <div key={d} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${LS_INFO[d].color}, #8B5CF6)` }}>
                    <DIcon className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>
                  <span className="font-bold text-foreground">{LS_INFO[d].label}</span>
                </div>
              );
            })}
          </div>

          {/* Bar chart */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Puntajes por estilo (máx. 60)</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={barData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 60]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: "Poppins", fontSize: 11, borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="puntaje" radius={[8, 8, 0, 0]}>
                  {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scores detail */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
              const info = LS_INFO[k];
              const RowIcon = info.Icon;
              return (
                <div key={k} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: info.bg }}>
                    <RowIcon className="w-4 h-4" style={{ color: info.color }} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{info.label}</p>
                    <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(v / maxScore) * 100}%`, background: info.color }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold" style={{ color: info.color }}>{v}/60</span>
                    {dominant.includes(k) && <p className="text-xs font-bold" style={{ color: info.color }}>Predom.</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scale distribution */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Distribución de respuestas (36 preguntas)</p>
            <div className="space-y-2">
              {LS_SCALE.map(opt => (
                <div key={opt.value} className="flex items-center gap-3">
                  <span className="text-xs w-28 flex-shrink-0 font-medium" style={{ color: opt.color }}>
                    {opt.value} — {opt.label}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(lsScaleCount[opt.value] / 36) * 100}%`, background: opt.color }} />
                  </div>
                  <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: opt.color }}>
                    {lsScaleCount[opt.value]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "mi" | "ls">("all");
  const [selected, setSelected] = useState<TestRecord | null>(null);
  const [tab, setTab] = useState<"table" | "charts">("table");

  useEffect(() => { setRecords(getRecords().reverse()); }, []);

  const miRecords = records.filter(r => r.type === "mi") as MIRecord[];
  const lsRecords = records.filter(r => r.type === "ls") as LSRecord[];

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (typeFilter === "all" || r.type === typeFilter)
  );

  // Charts data
  const miDomCounts: Record<string, number> = {};
  miRecords.forEach(r => r.dominant.forEach(d => { miDomCounts[d] = (miDomCounts[d] || 0) + 1; }));
  const miPieData = Object.entries(miDomCounts).map(([k, v]) => ({ name: MI_INFO[k].label, value: v, color: MI_INFO[k].color }));

  const lsDomCounts: Record<string, number> = {};
  lsRecords.forEach(r => r.dominant.forEach(d => { lsDomCounts[d] = (lsDomCounts[d] || 0) + 1; }));
  const lsBarData = Object.entries(lsDomCounts).map(([k, v]) => ({ name: LS_INFO[k].label, count: v, fill: LS_INFO[k].color }));

  const uniqueNames = new Set(records.map(r => r.name.toLowerCase())).size;

  const stats = [
    { label: "Tests realizados",      value: records.length,  Icon: BarChart2,       color: "#6C63FF", bg: "#EDE9FE" },
    { label: "Estudiantes únicos",    value: uniqueNames,     Icon: UserRound,       color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Tests de Inteligencia", value: miRecords.length, Icon: Brain,          color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "Tests de Estilos",      value: lsRecords.length, Icon: BookOpen,       color: "#10B981", bg: "#D1FAE5" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)" }}>
            <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm">Panel Administrador</h1>
            <p className="text-xs text-muted-foreground">NeuroTest · Resultados generales</p>
          </div>
        </div>
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:bg-muted transition-all">
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: bg, color }}>
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {([
            { id: "table",  label: "Tabla de resultados" },
            { id: "charts", label: "Gráficos generales" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.id
                ? { background: "linear-gradient(135deg, #6C63FF, #8B5CF6)", color: "#fff" }
                : { background: "#F1F5F9", color: "#64748B" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Charts tab */}
        {tab === "charts" && (
          <div className="space-y-4">
            {/* MI pie */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4" style={{ color: "#6C63FF" }} strokeWidth={1.75} />
                <h3 className="font-semibold text-foreground text-sm">Distribución de Inteligencias Predominantes</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Test de Howard Gardner — {miRecords.length} registros</p>
              {miPieData.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">Sin datos aún</p>
                : (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <ResponsiveContainer width={200} height={180}>
                      <PieChart>
                        <Pie data={miPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value">
                          {miPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontFamily: "Poppins", fontSize: 11, borderRadius: 12, border: "none" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {miPieData.sort((a, b) => b.value - a.value).map(d => {
                        const entry = Object.entries(MI_INFO).find(([, v]) => v.label === d.name);
                        const EntryIcon = entry ? MI_INFO[entry[0]].Icon : Brain;
                        return (
                          <div key={d.name} className="flex items-center gap-2">
                            <EntryIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: d.color }} strokeWidth={1.75} />
                            <span className="text-xs text-muted-foreground flex-1 truncate">{d.name}</span>
                            <span className="text-xs font-bold text-foreground">{d.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            {/* LS bar */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4" style={{ color: "#3B82F6" }} strokeWidth={1.75} />
                <h3 className="font-semibold text-foreground text-sm">Distribución de Estilos de Aprendizaje</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Test de Lynn O'Brien — {lsRecords.length} registros</p>
              {lsBarData.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">Sin datos aún</p>
                : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={lsBarData} barSize={48}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontFamily: "Poppins", fontSize: 11, borderRadius: 12, border: "none" }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} label={{ position: "top", fontSize: 12, fill: "#374151", fontFamily: "Poppins", fontWeight: "bold" }}>
                        {lsBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </div>
          </div>
        )}

        {/* Table tab */}
        {tab === "table" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm">Todos los registros</h3>
                <p className="text-xs text-muted-foreground">{filtered.length} de {records.length} entradas</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} />
                  <input type="text" placeholder="Buscar nombre..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl border border-border text-xs outline-none w-full sm:w-44 bg-background text-foreground"
                    style={{ fontFamily: "inherit" }} />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as "all" | "mi" | "ls")}
                  className="px-3 py-2 rounded-xl border border-border text-xs outline-none bg-background text-foreground"
                  style={{ fontFamily: "inherit" }}>
                  <option value="all">Todos los tests</option>
                  <option value="mi">Inteligencias Múltiples</option>
                  <option value="ls">Estilos de Aprendizaje</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/40">
                    {["Estudiante", "Test", "Resultado predominante", "Fecha", "Hora"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      {records.length === 0
                        ? "Aún no hay registros. Los resultados aparecerán aquí después de completar un test."
                        : "No se encontraron resultados con esos filtros."}
                    </td></tr>
                  ) : filtered.map(r => {
                    const isMI = r.type === "mi";
                    const domKeys = r.dominant;
                    const firstInfo = isMI ? MI_INFO[domKeys[0]] : LS_INFO[domKeys[0]];
                    const TypeIcon = isMI ? Brain : BookOpen;
                    return (
                      <tr key={r.id} onClick={() => setSelected(r)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${firstInfo.color}, #8B5CF6)` }}>
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={isMI ? { background: "#EDE9FE", color: "#6C63FF" } : { background: "#DBEAFE", color: "#3B82F6" }}>
                            <TypeIcon className="w-3 h-3" strokeWidth={2} />
                            {isMI ? "Inteligencias" : "Estilos"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {domKeys.map(d => {
                              const inf = isMI ? MI_INFO[d] : LS_INFO[d];
                              const DIcon = inf.Icon;
                              return (
                                <span key={d} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                                  style={{ background: inf.bg, color: inf.color }}>
                                  <DIcon className="w-3 h-3" strokeWidth={2} />
                                  {isMI ? (inf as MIInfoItem).short : (inf as LSInfoItem).label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />{r.date}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />{r.time}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selected && <StudentDetail record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [currentName, setCurrentName] = useState("");
  const [currentMIRecord, setCurrentMIRecord] = useState<MIRecord | null>(null);
  const [currentLSRecord, setCurrentLSRecord] = useState<LSRecord | null>(null);

  function handleMIComplete(answers: MIAnswer[]) {
    const { scores, dominant } = scoreMI(answers);
    const rec: MIRecord = { id: uid(), type: "mi", name: currentName, date: nowDate(), time: nowTime(), answers, scores, dominant };
    saveRecord(rec);
    setCurrentMIRecord(rec);
    setScreen("mi-analyzing");
  }

  function handleLSComplete(answers: number[]) {
    const { scores, dominant } = scoreLS(answers);
    const rec: LSRecord = { id: uid(), type: "ls", name: currentName, date: nowDate(), time: nowTime(), answers, scores, dominant };
    saveRecord(rec);
    setCurrentLSRecord(rec);
    setScreen("ls-analyzing");
  }

  function goHome() {
    setScreen("home");
    setCurrentName("");
    setCurrentMIRecord(null);
    setCurrentLSRecord(null);
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {screen === "home"         && <HomeScreen onMI={() => setScreen("mi-name")} onLS={() => setScreen("ls-name")} onAdmin={() => setScreen("admin-login")} />}
      {screen === "mi-name"      && <NameScreen title="Test de Inteligencias Múltiples" subtitle="Howard Gardner · 35 preguntas · Responde V, F o En blanco" onNext={n => { setCurrentName(n); setScreen("mi-test"); }} onBack={goHome} />}
      {screen === "mi-test"      && <MITestScreen onComplete={handleMIComplete} />}
      {screen === "mi-analyzing" && <AnalyzingScreen text="Analizando tus respuestas..." onDone={() => setScreen("mi-results")} />}
      {screen === "mi-results"   && currentMIRecord && <MIResultsScreen record={currentMIRecord} onHome={goHome} />}
      {screen === "ls-name"      && <NameScreen title="Test de Estilos de Aprendizaje" subtitle="Lynn O'Brien · 36 preguntas · Escala 1 (Casi nunca) a 5 (Casi siempre)" onNext={n => { setCurrentName(n); setScreen("ls-test"); }} onBack={goHome} />}
      {screen === "ls-test"      && <LSTestScreen onComplete={handleLSComplete} />}
      {screen === "ls-analyzing" && <AnalyzingScreen text="Calculando tu estilo de aprendizaje..." onDone={() => setScreen("ls-results")} />}
      {screen === "ls-results"   && currentLSRecord && <LSResultsScreen record={currentLSRecord} onHome={goHome} />}
      {screen === "admin-login"  && <AdminLoginScreen onSuccess={() => setScreen("admin-dashboard")} onBack={goHome} />}
      {screen === "admin-dashboard" && <AdminDashboard onBack={goHome} />}
    </div>
  );
}
