import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { SHAPES, WATERS, statusMeta } from "./dashboardTypes.ts";
import type { Status } from "./dashboardTypes.ts";
import { Icon } from "./dashboardIcons.tsx";
import type { IconName } from "./dashboardIcons.tsx";

export const Card = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <article
    className={`rounded-2xl border border-[#E4E4EA] bg-white p-6 shadow-[0_1px_2px_rgba(30,33,64,0.04)] ${className}`}
  >
    {children}
  </article>
);

export const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-xl font-semibold tracking-tight text-[#1E2140]">
    {children}
  </h2>
);

type BtnProps = {
  icon?: IconName;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const GhostButton = ({
  icon,
  children,
  className = "",
  ...rest
}: BtnProps) => (
  <button
    type="button"
    {...rest}
    className={`inline-flex items-center gap-2 rounded-full border border-[#E4E4EA] bg-white px-4 py-2 text-sm font-medium text-[#1E2140] transition hover:border-[#E8711A] hover:text-[#E8711A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {icon && <Icon name={icon} className="h-4 w-4" />}
    {children}
  </button>
);

export const PrimaryButton = ({
  icon,
  children,
  className = "",
  rounding = "full",
  ...rest
}: BtnProps & { rounding?: "full" | "xl" }) => (
  <button
    type="button"
    {...rest}
    className={`inline-flex items-center justify-center gap-2 ${rounding === "full" ? "rounded-full" : "rounded-xl"} bg-[#E8711A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d3640f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {icon && <Icon name={icon} className="h-4 w-4" />}
    {children}
  </button>
);

export const StatusBadge = ({ status }: { status: Status }) => (
  <span
    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta[status].cls}`}
  >
    {statusMeta[status].label}
  </span>
);

export const MetaChip = ({
  icon,
  children,
}: {
  icon: IconName;
  children: ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F1F5] px-3 py-1 text-xs font-medium text-[#1E2140]">
    <Icon name={icon} className="h-3.5 w-3.5 text-[#E8711A]" />
    {children}
  </span>
);

export const inputCls =
  "w-full rounded-xl border border-[#E4E4EA] bg-white px-3.5 py-2.5 text-sm text-[#1E2140] placeholder:text-[#9A9DB3] focus:border-[#E8711A] focus:outline-none focus:ring-2 focus:ring-[#E8711A]/25";

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-[#1E2140]">
      {label}
    </span>
    {children}
  </label>
);

export const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E2140]/50 p-4 sm:items-center"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[#1E2140]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6E85] transition hover:bg-[#F1F1F5] hover:text-[#1E2140]"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Toast = ({ message }: { message: string | null }) =>
  message ? (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1E2140] px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      <Icon name="check" className="h-4 w-4 text-[#E8711A]" />
      {message}
    </div>
  ) : null;

export const PathThumb = ({
  shapeIndex,
  className = "",
}: {
  shapeIndex: number;
  className?: string;
}) => {
  const shape = SHAPES[shapeIndex];
  return (
    <svg
      viewBox="0 0 1000 320"
      className={`w-full rounded-lg bg-[#F1F5EC] ${className}`}
      aria-hidden="true"
    >
      <path
        d={WATERS[shapeIndex % WATERS.length]}
        fill="none"
        stroke="#CFE3F1"
        strokeWidth="40"
        strokeLinecap="round"
      />
      <path
        d={shape.path}
        fill="none"
        stroke="#fff"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={shape.path}
        fill="none"
        stroke="#E8711A"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
