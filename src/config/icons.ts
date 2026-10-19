// One icon family (Lucide) at one stroke weight. Features refer to icons by key
// so the config stays plain data and the set can be swapped in one place.
import {
  Accessibility, Activity, Atom, Award, Backpack, Bell, BookOpen, Brain, Briefcase, Bus,
  Calculator, Calendar, CalendarCheck, CalendarClock, CalendarDays, Camera, ChartBar, ChartLine,
  Clock, Coffee, Compass, Copy, DollarSign, Download, Dumbbell, FileCheck, FileText, FlaskConical,
  Flag, Flame, Footprints, Gamepad2, Gauge, Gift, Glasses, Globe, GraduationCap, Headphones, Heart,
  HeartHandshake, History, Info, Kanban, Keyboard, Landmark, Languages, Layers, Lightbulb, ListChecks,
  ListTree, Lock, Mail, Map, MapPin, Medal, MessageCircle, MessagesSquare, Mic, Milestone, Moon,
  Mountain, Music, Navigation, Network, NotebookPen, Palette, PenLine, Percent, Phone, PiggyBank,
  Printer, Puzzle, Quote, Repeat, Rocket, Route, Ruler, Scale, School, Search, Settings, Shapes,
  ShieldAlert, ShieldCheck, Shuffle, Signpost, SlidersHorizontal, Smartphone, Sigma, SpellCheck,
  SquareFunction, Star, Sunrise, Swords, Table, Target, Tent, Ticket, Timer, TrendingUp, Trophy,
  Type, User, UserRound, Users, Video, Volume2, Wallet, Wifi, WifiOff, Wrench, BatteryMedium,
  Bookmark, House, LifeBuoy, Siren, Stethoscope, Binary, Sprout, Hourglass, Eye, Link, Share2,
  type LucideIcon,
} from "lucide-react";

export const ICONS = {
  accessibility: Accessibility, activity: Activity, atom: Atom, award: Award, backpack: Backpack,
  bell: Bell, book: BookOpen, brain: Brain, briefcase: Briefcase, bus: Bus, calculator: Calculator,
  calendar: Calendar, "calendar-check": CalendarCheck, "calendar-clock": CalendarClock,
  "calendar-days": CalendarDays, camera: Camera, "chart-bar": ChartBar, "chart-line": ChartLine,
  clock: Clock, coffee: Coffee, compass: Compass, copy: Copy, dollar: DollarSign, download: Download,
  dumbbell: Dumbbell, "file-check": FileCheck, "file-text": FileText, flask: FlaskConical,
  flag: Flag, flame: Flame, footprints: Footprints, gamepad: Gamepad2, gauge: Gauge, gift: Gift,
  glasses: Glasses, globe: Globe, graduation: GraduationCap, headphones: Headphones, heart: Heart,
  handshake: HeartHandshake, history: History, info: Info, kanban: Kanban, keyboard: Keyboard,
  landmark: Landmark, languages: Languages, layers: Layers, lightbulb: Lightbulb,
  "list-checks": ListChecks, "list-tree": ListTree, lock: Lock, mail: Mail, map: Map,
  "map-pin": MapPin, medal: Medal, message: MessageCircle, messages: MessagesSquare, mic: Mic,
  milestone: Milestone, moon: Moon, mountain: Mountain, music: Music, navigation: Navigation,
  network: Network, notebook: NotebookPen, palette: Palette, pen: PenLine, percent: Percent,
  phone: Phone, piggy: PiggyBank, printer: Printer, puzzle: Puzzle, quote: Quote, repeat: Repeat,
  rocket: Rocket, route: Route, ruler: Ruler, scale: Scale, school: School, search: Search,
  settings: Settings, shapes: Shapes, "shield-alert": ShieldAlert, "shield-check": ShieldCheck,
  shuffle: Shuffle, signpost: Signpost, sliders: SlidersHorizontal, smartphone: Smartphone,
  sigma: Sigma, "spell-check": SpellCheck, "square-function": SquareFunction, star: Star,
  sunrise: Sunrise, swords: Swords, table: Table, target: Target, tent: Tent, ticket: Ticket,
  timer: Timer, trending: TrendingUp, trophy: Trophy, type: Type, user: User, "user-round": UserRound,
  users: Users, video: Video, volume: Volume2, wallet: Wallet, wifi: Wifi, "wifi-off": WifiOff,
  wrench: Wrench, battery: BatteryMedium, bookmark: Bookmark, house: House, lifebuoy: LifeBuoy,
  siren: Siren, stethoscope: Stethoscope, binary: Binary, sprout: Sprout, hourglass: Hourglass,
  eye: Eye, link: Link, share: Share2,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
