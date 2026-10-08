import { useEffect, useRef, useState } from "react";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
import { API_BASE, TEXT } from "../data/loginData.ts";
import {
  CONTACT_DETAILS,
  CONTACT_ADDRESS_LINE,
  CONTACT_CITY_LINE,
} from "../data/contact.ts";
import "beercss/scoped";

const SUBJECT_OPTIONS = [
  { value: "Vraag over een route", icon: "route" },
  { value: "Technische ondersteuning", icon: "build" },
  { value: "Samenwerking / pers", icon: "handshake" },
  { value: "Overig", icon: "more_horiz" },
];

async function apiPost(body: unknown) {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    return { status: res.status, body: json };
  } catch (err) {
    return {
      status: 0,
      body: {
        error: err instanceof Error ? err.message : TEXT.common.serverUnreachable,
      },
    };
  }
}

interface ContactDetail {
  icon: string;
  label: string;
  value: string;
  sub: string;
}

const CONTACT_ITEMS: ContactDetail[] = [
  {
    icon: "location_on",
    label: "Bezoekadres",
    value: CONTACT_ADDRESS_LINE,
    sub: CONTACT_CITY_LINE,
  },
  {
    icon: "mail",
    label: "E-mailadres",
    value: CONTACT_DETAILS.email,
    sub: "Binnen 24 uur antwoord",
  },
  {
    icon: "call",
    label: "Telefoonnummer",
    value: CONTACT_DETAILS.phone,
    sub: "Ma-Vr van 09:00 tot 17:00",
  },
  {
    icon: "schedule",
    label: "Openingstijden",
    value: "Maandag – Vrijdag",
    sub: "09:00 – 17:00 (Weekend gesloten)",
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Hoe kan ik zelf een route toevoegen?",
    answer:
      "Kies op het tabblad 'Routes' twee of meer plekken op de kaart; de app plant de route voor je. Deel hem daarna met het deel-icoon of bewaar hem met het bookmark-icoon.",
  },
  {
    question: "Zijn de historische kaarten nauwkeurig?",
    answer:
      "De historische kaarten zijn gedigitaliseerd op basis van originele archiefstukken van de gemeente Zwolle. Kleine afwijkingen zijn mogelijk doordat straten en gebouwen door de eeuwen heen zijn veranderd.",
  },
  {
    question: "Kan ik een route bewaren?",
    answer:
      "Ja, tik op het bookmark-icoon bij een route om hem op te slaan. Met de filteroptie 'Opgeslagen door jou' zie je daarna alleen nog je eigen routes.",
  },
  {
    question: "Is deze website gratis te gebruiken?",
    answer:
      "Zwolle Routes is volledig gratis, inclusief het bekijken van historische kaarten en het aanmaken van je eigen routes.",
  },
];

function SubjectSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected =
    SUBJECT_OPTIONS.find((o) => o.value === value) ?? SUBJECT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="field label prefix suffix border round m-0! cursor-pointer!"
    >
      <i>{selected.icon}</i>
      <input
        id="onderwerp"
        name="onderwerp"
        type="text"
        readOnly
        placeholder=" "
        value={selected.value}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="cursor-pointer! font-medium!"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === " " ||
            e.key === "ArrowDown"
          ) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />

      <label htmlFor="onderwerp">Onderwerp</label>

      <i
        className={`transition-transform! pointer-events-none! ${open ? "rotate-180!" : ""}`}
      >
        arrow_drop_down
      </i>
      <menu
        className={`min${open ? " active" : ""} min-w-full! top-full! mt-1! p-2! max-h-56! overflow-y-auto!`}
        role="listbox"
      >
        {SUBJECT_OPTIONS.map((option) => {
          const isSelected = option.value === value;

          return (
            <li
              key={option.value}
              role="option"
              aria-selected={isSelected}
              className={`round${isSelected ? " primary-container" : ""} cursor-pointer! min-h-10! py-1!`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <i>{option.icon}</i>

              <div className="max">{option.value}</div>

              {isSelected && <i>check</i>}
            </li>
          );
        })}
      </menu>
    </div>
  );
}

function ContactForm() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [onderwerp, setOnderwerp] = useState(SUBJECT_OPTIONS[0].value);
  const [bericht, setBericht] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!naam || !email || !bericht || !onderwerp) {
      setError("Vul alle verplichte velden in.");
      return;
    }

    setLoading(true);

    const { status, body } = await apiPost({
      name: naam,
      email: email,
      subject: onderwerp,
      message: bericht,
    });

    setLoading(false);

    if (status >= 200 && status < 300) {
      setSuccess(true);
      setNaam("");
      setEmail("");
      setOnderwerp(SUBJECT_OPTIONS[0].value);
      setBericht("");
      return;
    }

    setError(
      body?.error ||
        "Er is iets misgegaan bij het verzenden. Probeer het opnieuw."
    );
  };

  return (
    <article className="border round flex-1! m-0! p-10!">
      <h2 className="font-display! mb-6! text-xl!">
        Stuur een bericht
      </h2>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex! flex-col! gap-6!"
      >
        <div className="field label border round m-0!">
          <input
            id="naam"
            name="naam"
            type="text"
            placeholder=" "
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
          />

          <label htmlFor="naam">Naam</label>
        </div>

        <div className="field label border round m-0!">
          <input
            id="email"
            name="email"
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="email">E-mailadres</label>
        </div>

        <SubjectSelect
          value={onderwerp}
          onChange={setOnderwerp}
        />

        <div className="field label textarea border round m-0!">
          <textarea
            id="bericht"
            name="bericht"
            rows={7}
            placeholder=" "
            value={bericht}
            onChange={(e) => setBericht(e.target.value)}
          />
          <label htmlFor="bericht">Bericht</label>
        </div>

        {error && (
          <article className="error-container round no-elevate">
            <div className="row">
              <i>error</i>
              <div className="max">{error}</div>
            </div>
          </article>
        )}

        {success && (
          <article className="tertiary-container round no-elevate">
            <div className="row">
              <i>check_circle</i>
              <div className="max">
                Bedankt! Je bericht is verstuurd, we reageren binnen 24 uur.
              </div>
            </div>
          </article>
        )}

        <button
          type="submit"
          disabled={loading}
          className="responsive large"
        >
          {loading ? (
            <>
              <progress className="circle small" />
              <span>Bezig met verzenden…</span>
            </>
          ) : (
            <>
              <i>send</i>
              <span>Verstuur bericht</span>
            </>
          )}
        </button>
      </form>
    </article>
  );
}

function ContactDetailCard({
  icon,
  label,
  value,
  sub,
}: ContactDetail) {
  return (
    <article className="border round flex! flex-1! m-0! items-center!">
      <div className="row w-full!">
        <div className="circle primary-container w-14! h-14! min-w-14! flex! items-center! justify-center!">
          <i className="text-[1.75rem]!">{icon}</i>
        </div>

        <div className="max">
          <div className="small-text secondary-text">
            {label}
          </div>

          <div className="no-margin text-[1.1rem]!">
            {value}
          </div>

          <div className="small-text secondary-text text-xs!">
            {sub}
          </div>
        </div>
      </div>
    </article>
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
    <article className="border round no-padding text-inherit!">
      <details open={isOpen}>
        <summary
          /* beercss scoped build applies .beer * { all: revert }; tailwind utilities inside need ! */
          className="none horizontal-padding h-12! rounded-box! flex! items-center!"
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          aria-expanded={isOpen}
        >
          <div className="row">
            <div className="max bold text-inherit!">
              {item.question}
            </div>

            <i className="circle small primary-container">
              {isOpen ? "remove" : "add"}
            </i>
          </div>
        </summary>

        <div className="padding">
          <p className="no-margin secondary-text">
            {item.answer}
          </p>
        </div>
      </details>
    </article>
  );
}

export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Neem contact met ons op"
        description="Een vraag over een route of iets dat niet werkt? Stuur een bericht, we helpen je graag verder."
      />

      <section className="py-band">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="beer lg:col-span-2 flex! flex-col! h-full!">
              <ContactForm />
            </div>

            <div className="beer flex! flex-col! h-full! gap-4!">
              {CONTACT_ITEMS.map((detail) => (
                <ContactDetailCard
                  key={detail.label}
                  {...detail}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-band">
        <Container>
          <h2
            className="mb-6 font-display text-2xl font-bold on-background"
          >
            Veelgestelde vragen
          </h2>

          <div className="beer text-inherit!">
            {FAQ_ITEMS.map((item, index) => (
              <FAQAccordionItem
                key={item.question}
                item={item}
                isOpen={openFAQ === index}
                onToggle={() =>
                  setOpenFAQ((current) =>
                    current === index ? null : index
                  )
                }
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
