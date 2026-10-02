import { useEffect, useRef, useState } from "react";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
import "beercss/scoped";

const SUBJECT_OPTIONS = [
  { value: "Vraag over een route", icon: "route" },
  { value: "Technische ondersteuning", icon: "build" },
  { value: "Samenwerking / pers", icon: "handshake" },
  { value: "Overig", icon: "more_horiz" },
];

const API_BASE = "http://localhost:3000/api";

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
        error: err instanceof Error ? err.message : "cannot connect to server",
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

const CONTACT_DETAILS: ContactDetail[] = [
  {
    icon: "location_on",
    label: "Bezoekadres",
    value: "Grote Markt 20",
    sub: "8011 LV Zwolle, Nederland",
  },
  {
    icon: "mail",
    label: "E-mailadres",
    value: "info@zwolleroutes.nl",
    sub: "Binnen 24 uur antwoord",
  },
  {
    icon: "call",
    label: "Telefoonnummer",
    value: "038 421 6200",
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

const COLUMN_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

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
      className="field large label prefix suffix border round"
      style={{ margin: 0, cursor: "pointer" }}
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
        style={{
          cursor: "pointer",
          fontWeight: 500,
        }}
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
        style={{
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "none",
          pointerEvents: "none",
        }}
      >
        arrow_drop_down
      </i>
      <menu
        className={`min${open ? " active" : ""}`}
        role="listbox"
        style={{
          minWidth: "100%",
          top: "100%",
          marginTop: "0.25rem",
          padding: "0.5rem",
          maxHeight: "14rem",
          overflowY: "auto",
        }}
      >
        {SUBJECT_OPTIONS.map((option) => {
          const isSelected = option.value === value;

          return (
            <li
              key={option.value}
              role="option"
              aria-selected={isSelected}
              className={`round${isSelected ? " primary-container" : ""}`}
              style={{
                cursor: "pointer",
                minHeight: "2.5rem",
                paddingBlock: "0.25rem",
              }}
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
      subject: `${onderwerp}`,
      message: ` ${bericht}`,
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
    <article
      className="border round"
      style={{
        flex: 1,
        margin: 0,
        padding: "2.5rem",
      }}
    >
      <h5
        className="font-heading!"
        style={{
          marginBottom: "1.5rem",
        }}
      >
        Stuur een bericht
      </h5>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          className="field large label border round"
          style={{ margin: 0 }}
        >
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

        <div
          className="field large label border round"
          style={{ margin: 0 }}
        >
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

        <div
          className="field label textarea border round"
          style={{ margin: 0 }}
        >
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
          className="responsive large extra"
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
    <article
      className="border round"
      style={{
        flex: 1,
        margin: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="row"
        style={{
          width: "100%",
        }}
      >
        <div
          className="circle primary-container"
          style={{
            width: "3.5rem",
            height: "3.5rem",
            minWidth: "3.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i style={{ fontSize: "1.75rem" }}>{icon}</i>
        </div>

        <div className="max">
          <div className="small-text secondary-text">
            {label}
          </div>

          <h6
            className="no-margin"
            style={{
              fontSize: "1.1rem",
            }}
          >
            {value}
          </h6>

          <div
            className="small-text secondary-text"
            style={{
              fontSize: "0.75rem",
            }}
          >
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
    <article
      className="border round no-padding"
      style={{
        color: "inherit",
      }}
    >
      <details open={isOpen}>
        <summary
          className="none padding"
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          aria-expanded={isOpen}
        >
          <div className="row">
            <div
              className="max bold"
              style={{
                color: "inherit",
              }}
            >
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
            <div
              className="beer lg:col-span-2"
              style={COLUMN_STYLE}
            >
              <ContactForm />
            </div>

            <div
              className="beer"
              style={{
                ...COLUMN_STYLE,
                gap: "1rem",
              }}
            >
              {CONTACT_DETAILS.map((detail) => (
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
            className="mb-6 font-heading text-2xl font-bold on-background"
          >
            Veelgestelde vragen
          </h2>

          <div
            className="beer"
            style={{
              color: "inherit",
            }}
          >
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
