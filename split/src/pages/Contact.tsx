import { useState } from "react";
import {
  Search,
  MapPin,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";

const NAV_LINKS = ["Home", "Routes", "Planning", "Points of Interest", "Contact"];

const SUBJECT_OPTIONS = [
  "Vraag over een route",
  "Technische ondersteuning",
  "Samenwerking / pers",
  "Overig",
];

interface ContactDetail {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}

const CONTACT_DETAILS: ContactDetail[] = [
  {
    icon: MapPin,
    label: "Bezoekadres",
    value: "Grote Markt 20",
    sub: "8011 LV Zwolle, Nederland",
  },
  {
    icon: Mail,
    label: "E-mailadres",
    value: "info@zwolleroutes.nl",
    sub: "Binnen 24 uur antwoord",
  },
  {
    icon: Phone,
    label: "Telefoonnummer",
    value: "038 421 6200",
    sub: "Ma-Vr van 09:00 tot 17:00",
  },
  {
    icon: Clock,
    label: "Openingstijden",
    value: "Maandag – Vrijdag",
    sub: "09:00 – 17:00 (Weekend gesloten)",
  },
];

interface FAQItem {
  question: string;
  answer: string;
}
// from db later
const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Hoe kan ik zelf een route toevoegen?",
    answer:
      "Log in op je account en ga naar het tabblad 'Planning'. Klik op de knop '+ Nieuwe route' om zelf een route op de kaart te tekenen. Na het opslaan kun je de route openbaar maken voor de community.",
  },
  {
    question: "Zijn de historische kaarten nauwkeurig?",
    answer:
      "De historische kaarten zijn gedigitaliseerd op basis van originele archiefstukken van de gemeente Zwolle. Kleine afwijkingen zijn mogelijk doordat straten en gebouwen door de eeuwen heen zijn veranderd.",
  },
  {
    question: "Kan ik de app offline gebruiken?",
    answer:
      "Ja, je kunt routes vooraf downloaden voor offline gebruik. Ga naar een route en tik op 'Beschikbaar offline' voordat je de deur uit gaat.",
  },
  {
    question: "Is deze website gratis te gebruiken?",
    answer:
      "Zwolle Routes is volledig gratis, inclusief het bekijken van historische kaarten en het aanmaken van je eigen routes.",
  },
];

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <span className="font-serif text-xl font-bold text-gray-900">
          Zwolle Routes
        </span>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = link === "Contact";
            return (
              <a
                key={link}
                href="#"
                className={
                  isActive
                    ? "text-sm font-medium text-orange-600"
                    : "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                }
              >
                {link}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Zoeken"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-700">

          </div>
        </div>
      </div>
    </header>
  );
}

function ContactForm() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-semibold text-gray-900">
        Stuur een bericht
      </h2>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label
            htmlFor="naam"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Naam
          </label>
          <input
            id="naam"
            name="naam"
            type="text"
            placeholder="Jouw naam"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            E-mailadres
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jij@voorbeeld.nl"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label
            htmlFor="onderwerp"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Onderwerp
          </label>
          <div className="relative">
            <select
              id="onderwerp"
              name="onderwerp"
              defaultValue={SUBJECT_OPTIONS[0]}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
            >
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label
            htmlFor="bericht"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Bericht
          </label>
          <textarea
            id="bericht"
            name="bericht"
            rows={4}
            placeholder="Wat wil je ons vragen of vertellen?"
            className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-orange-600 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"
        >
          Verstuur bericht
        </button>
      </form>
    </div>
  );
}

function ContactDetailCard({ icon: Icon, label, value, sub }: ContactDetail) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 text-[15px] font-semibold text-gray-900">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[15px] font-medium text-gray-900">
          {item.question}
        </span>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          {isOpen ? (
            <Minus className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pr-8 text-sm leading-relaxed text-gray-600">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400">
      © 2026 Zwolle Routes · Studentproject Deltion College
    </footer>
  );
}
export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-bold text-gray-900">
            Contact
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Neem contact met ons op — we helpen je graag verder.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          <div className="flex flex-col gap-4">
            {CONTACT_DETAILS.map((detail) => (
              <ContactDetailCard key={detail.label} {...detail} />
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">
            Veelgestelde vragen
          </h2>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <FAQAccordionItem
                key={item.question}
                item={item}
                isOpen={openFAQ === index}
                onToggle={() =>
                  setOpenFAQ((current) => (current === index ? null : index))
                }
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
