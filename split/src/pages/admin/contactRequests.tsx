import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../backend/adminApi.ts";
import Icon from "../../shared/primitives/icon.tsx";

const CONTACT_STATUSES = ["nieuw", "in_behandeling", "afgerond"] as const;
type ContactStatus = (typeof CONTACT_STATUSES)[number];
type StatusFilter = ContactStatus | "alle";

interface ContactRequest {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
}

const STATUS_LABELS: Record<ContactStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  afgerond: "Afronden",
};

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "nieuw", label: "Nieuw" },
  { value: "in_behandeling", label: "In behandeling" },
  { value: "afgerond", label: "Afronden" },
];

export default function ContactRequests() {
  const completionDialogRef = useRef<HTMLDialogElement>(null);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("alle");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [requestToComplete, setRequestToComplete] =
    useState<ContactRequest | null>(null);

  useEffect(() => {
    const dialog = completionDialogRef.current;
    if (!dialog) return;
    if (requestToComplete && !dialog.open) dialog.showModal();
    if (!requestToComplete && dialog.open) dialog.close();
  }, [requestToComplete]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    api<ContactRequest[]>("/contact-requests")
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "Contactverzoeken laden is mislukt.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const visibleRequests = useMemo(
    () =>
      filter === "alle"
        ? requests
        : requests.filter((request) => request.status === filter),
    [filter, requests],
  );

  const deleteRequest = async (request: ContactRequest) => {
    setUpdatingId(request.id);
    setUpdateError("");
    setNotice("");
    try {
      await api<{ ok: true }>(
        `/contact-requests/${encodeURIComponent(String(request.id))}`,
        { method: "DELETE" },
      );
      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );
      setNotice("Contactverzoek verwijderd.");
    } catch (cause) {
      setUpdateError(
        cause instanceof Error
          ? cause.message
          : "Contactverzoek verwijderen is mislukt.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (
    request: ContactRequest,
    status: ContactStatus,
  ) => {
    setUpdatingId(request.id);
    setUpdateError("");
    setNotice("");
    try {
      const updated = await api<ContactRequest>(
        `/contact-requests/${encodeURIComponent(String(request.id))}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
      );
      setRequests((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(`Status bijgewerkt naar ${STATUS_LABELS[updated.status]}.`);
    } catch (cause) {
      setUpdateError(
        cause instanceof Error
          ? cause.message
          : "Status wijzigen is mislukt.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section aria-labelledby="contact-requests-title" className="space-y-6">
      <header>
        <h1
          id="contact-requests-title"
          className="font-display text-4xl font-semibold leading-tight tracking-tight"
        >
          Contactverzoeken
        </h1>
        <p className="mt-1.5 text-sm text-[#6B6E85]">
          Bekijk berichten van bezoekers en houd de afhandeling bij.
        </p>
      </header>

      <div
        role="group"
        aria-label="Filter op status"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`button round ripple min-h-12 px-4 ${
              filter === value
                ? "fill"
                : "border bg-white text-[#1E2140] hover:bg-[#F1F1F5]"
            }`}
          >
            {label}
            <span className="ml-2 text-xs tabular-nums">
              {value === "alle"
                ? requests.length
                : requests.filter((request) => request.status === value).length}
            </span>
          </button>
        ))}
      </div>

      {(loadError || updateError) && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E4EA] bg-white p-4 text-sm text-[#1E2140]"
        >
          <span>{loadError || updateError}</span>
          {loading ? null : (
            <button
              type="button"
              onClick={() => {
                setUpdateError("");
                setReloadKey((key) => key + 1);
              }}
              className="button border text-ink ripple"
            >
              Opnieuw proberen
            </button>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm text-[#2A2F5B]">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-[#6B6E85]">
          Contactverzoeken laden…
        </p>
      ) : loadError ? null : (
        visibleRequests.length === 0 ? (
          <article className="rounded-2xl border border-[#E4E4EA] bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-[#1E2140]">
              {requests.length === 0
                ? "Nog geen contactverzoeken"
                : "Geen verzoeken met deze status"}
            </h2>
            <p className="mt-2 text-sm text-[#6B6E85]">
              {requests.length === 0
                ? "Nieuwe berichten via de contactpagina verschijnen hier."
                : "Kies een andere status om meer verzoeken te bekijken."}
            </p>
          </article>
        ) : (
          <ul className="space-y-4">
            {visibleRequests.map((request) => (
              <li key={request.id}>
                <article className="rounded-2xl border border-[#E4E4EA] bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-semibold text-[#1E2140]">
                        {request.subject}
                      </h2>
                      <p className="mt-1 text-sm text-[#6B6E85]">
                        {request.name} ·{" "}
                        <a
                          href={`mailto:${request.email}`}
                          className="text-[#2A2F5B] underline underline-offset-2"
                        >
                          {request.email}
                        </a>
                      </p>
                    </div>
                    <label className="flex min-w-48 flex-col gap-1 text-xs font-semibold text-[#1E2140]">
                      Status
                      <select
                        value={request.status}
                        aria-label={`Status van contactverzoek ${request.id}`}
                        disabled={updatingId !== null}
                        onChange={(event) => {
                          const status = CONTACT_STATUSES.find(
                            (candidate) =>
                              candidate === event.currentTarget.value,
                          );
                          if (status === "afgerond") {
                            setRequestToComplete(request);
                          } else if (status) {
                            void updateStatus(request, status);
                          }
                        }}
                        className="min-h-12 rounded-xl border border-[#E4E4EA] bg-white px-3 text-sm font-medium disabled:opacity-60"
                      >
                        {CONTACT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {request.status === "afgerond" && (
                    <button
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => setRequestToComplete(request)}
                      className="button border text-ink ripple mt-4 disabled:opacity-60"
                    >
                      Afronden
                    </button>
                  )}
                  <p className="mt-5 whitespace-pre-wrap break-words border-t border-[#E4E4EA] pt-4 text-sm leading-relaxed text-[#1E2140]">
                    {request.message}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )
      )}
      <dialog
        ref={completionDialogRef}
        aria-labelledby="complete-request-title"
        aria-describedby="complete-request-description"
        onCancel={(event) => {
          event.preventDefault();
          setRequestToComplete(null);
        }}
        className="w-11/12 max-w-md rounded-2xl border border-[#E4E4EA] bg-white p-0 text-[#1E2140] backdrop:bg-[#1E2140]/50"
      >
        {requestToComplete && (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FBE6D4] text-[#2A2F5B]">
                <Icon name="check_circle" className="text-3xl" />
              </span>
              <div>
                <h2
                  id="complete-request-title"
                  className="text-xl font-semibold text-[#1E2140]"
                >
                  Verzoek afronden?
                </h2>
                <p
                  id="complete-request-description"
                  className="mt-2 text-sm leading-relaxed text-[#6B6E85]"
                >
                  Weet je zeker dat je dit verzoek als afgerond wilt markeren?
                  Het wordt daarna definitief uit de database verwijderd.
                </p>
                <p className="mt-3 break-words text-sm font-semibold text-[#1E2140]">
                  {requestToComplete.subject}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setRequestToComplete(null)}
                className="button border text-ink ripple"
              >
                Annuleren
              </button>
              <button
                type="button"
                disabled={updatingId !== null}
                onClick={() => {
                  const request = requestToComplete;
                  setRequestToComplete(null);
                  void deleteRequest(request);
                }}
                className="button round ripple gap-2"
              >
                <Icon name="check" className="text-xl" />
                Afronden
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
