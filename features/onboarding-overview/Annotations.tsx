import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export const ANNOTATIONS = {
  overview: {
    title: "Onboarding Process",
    text: "End-to-end view of customer onboarding performance, from application submission through account completion and funding.",
  },
  filters: {
    title: "Filters — Channel, Source, Account Type, Time",
    text: "Allows performance to be analyzed by acquisition channel, customer source, account type, and reporting period.",
  },
  total: {
    title: "Total Accounts",
    text: "Total onboarding applications submitted during the selected period.",
  },
  completion: {
    title: "Completion Rate",
    text: "Percentage of submitted applications that successfully complete onboarding and become active accounts.",
  },
  kyc: {
    title: "KYC Rejection Rate",
    text: "Share of applications rejected during KYC, highlighting identity and document-related onboarding friction.",
  },
  rdn: {
    title: "RDN Rejection Rate",
    text: "Share of RDN applications rejected by partner banks, indicating friction during bank-account creation.",
  },
  funded: {
    title: "Funded Rate D+30",
    text: "Percentage of successfully opened accounts that receive funding within 30 days, indicating post-onboarding activation quality.",
  },
  M1: {
    title: "Channel & Source Mix",
    text: "Shows where new accounts originate and the contribution of Mobile, Offline, Web, Organic, and Sales-Assisted channels.",
  },
  M2: {
    title: "Web Volume Trend",
    text: "Tracks monthly onboarding volume generated through the Web channel to identify acquisition trends over time.",
  },
  M3: {
    title: "Web vs Mobile Conversion",
    text: "Compares Web and Mobile performance across submission, completion, funding, and KYC rejection to identify channel efficiency gaps.",
  },
  M4: {
    title: "Organic vs Sales-Assisted Scorecard",
    text: "Compares onboarding quality between Organic and Sales-Assisted acquisition, including completion, rejection, and funding performance.",
  },
  M5: {
    title: "Completion Rate (Cohort)",
    text: "Shows how effectively each registration cohort progresses from application to completed onboarding.",
  },
  M7: {
    title: "KYC Rejection & First-Time-Right",
    text: "Monitors KYC quality by balancing rejection rate against customers who pass KYC successfully on their first attempt.",
  },
  M8: {
    title: "RDN Rejection by Bank",
    text: "Identifies which partner banks contribute the highest RDN rejection rates and where operational improvement may be required.",
  },
  M9: {
    title: "Funded Rate D+7 & D+30",
    text: "Measures how quickly newly opened accounts become funded, helping assess early customer activation and dormant-account risk.",
  },
} as const;
export type AnnotationId = keyof typeof ANNOTATIONS;

const AnnotationContext = createContext<{
  enabled: boolean;
  open: Map<AnnotationId, HTMLElement>;
  toggleMode: () => void;
  toggle: (id: AnnotationId, anchor: HTMLElement) => void;
} | null>(null);

export function AnnotationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(() => new Map<AnnotationId, HTMLElement>());
  const close = (id: AnnotationId) =>
    setOpen((current) => {
      const next = new Map(current);
      next.delete(id);
      return next;
    });

  useEffect(() => {
    if (!enabled || !open.size) return;
    const outside = (event: PointerEvent) => {
      // Other targets stay open so annotations can be compared side by side.
      if (
        event.target instanceof Element &&
        event.target.closest(
          "[data-onboarding-annotation-target], [data-onboarding-annotation-popover], [data-onboarding-annotation-toggle]",
        )
      )
        return;
      setOpen(new Map());
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(new Map());
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
    };
  }, [enabled, open.size]);

  return (
    <AnnotationContext.Provider
      value={{
        enabled,
        open,
        toggleMode: () => {
          setEnabled((value) => !value);
          setOpen(new Map());
        },
        toggle: (id, anchor) =>
          setOpen((current) => {
            const next = new Map(current);
            if (next.has(id)) next.delete(id);
            else next.set(id, anchor);
            return next;
          }),
      }}
    >
      {children}
      {enabled &&
        [...open].map(([id, anchor]) => (
          <AnnotationPopover
            key={id}
            id={id}
            anchor={anchor}
            onClose={() => close(id)}
          />
        ))}
    </AnnotationContext.Provider>
  );
}

export function AnnotationToggle() {
  const context = useContext(AnnotationContext)!;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={context.enabled}
      onClick={context.toggleMode}
      data-onboarding-annotation-toggle
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <span
        aria-hidden="true"
        className={`relative h-4 w-7 rounded-full transition-colors ${context.enabled ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute left-0 top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${context.enabled ? "translate-x-3.5" : "translate-x-0.5"}`}
        />
      </span>
      Annotations
    </button>
  );
}

export function AnnotationTarget({
  annotationId,
  as: Tag = "div",
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  annotationId: AnnotationId;
  as?: "div" | "section";
}) {
  const context = useContext(AnnotationContext)!;
  const anchor = useRef<HTMLDivElement>(null);
  const isOpen = context.open.has(annotationId);
  const toggle = () => {
    if (anchor.current) context.toggle(annotationId, anchor.current);
  };
  return (
    <Tag
      {...props}
      ref={anchor}
      data-onboarding-annotation-target={
        context.enabled ? annotationId : undefined
      }
      className={`${className}${context.enabled ? " relative cursor-pointer transition-shadow hover:ring-2 hover:ring-blue-200" : ""}${context.enabled && isOpen ? " ring-2 ring-blue-200" : ""}`}
      onClick={
        context.enabled
          ? (event) => {
              props.onClick?.(event);
              // Native controls keep their existing behavior; chart pointer events still bubble.
              if (
                event.defaultPrevented ||
                (event.target instanceof Element &&
                  event.target.closest(
                    "button, select, input, textarea, a, label, [role='dialog'], [contenteditable='true']",
                  ))
              )
                return;
              toggle();
            }
          : props.onClick
      }
    >
      {children}
      {context.enabled && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`${isOpen ? "Hide" : "Show"} annotation: ${ANNOTATIONS[annotationId].title}`}
          aria-expanded={isOpen}
          aria-controls={isOpen ? `annotation-${annotationId}` : undefined}
          className="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-2 focus:z-10 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-xs focus:text-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          {isOpen ? "Hide" : "Show"} annotation
        </button>
      )}
    </Tag>
  );
}

/** One non-modal, anchored popover shared by every overview annotation. */
function AnnotationPopover({
  id,
  anchor,
  onClose,
}: {
  id: AnnotationId;
  anchor: HTMLElement;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 280,
    visible: false,
  });
  useLayoutEffect(() => {
    const place = () => {
      if (!ref.current) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(
        280,
        rect.width,
        window.innerWidth - 24,
      );
      const height = ref.current.offsetHeight;
      const above = rect.top - height - 8;
      const top =
        above >= 12 ? above : rect.top + Math.min(rect.height, 56) + 8;
      const next = {
        width,
        top: Math.max(12, Math.min(top, window.innerHeight - height - 12)),
        left: Math.max(
          12,
          Math.min(rect.right - width, window.innerWidth - width - 12),
        ),
        visible: rect.bottom > 0 && rect.top < window.innerHeight,
      };
      setPosition((current) =>
        Object.keys(next).every(
          (key) =>
            current[key as keyof typeof next] ===
            next[key as keyof typeof next],
        )
          ? current
          : next,
      );
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(anchor);
    observer.observe(ref.current!);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor]);

  return createPortal(
    <div
      ref={ref}
      id={`annotation-${id}`}
      role="dialog"
      aria-label={`Annotation: ${ANNOTATIONS[id].title}`}
      data-onboarding-annotation-popover={id}
      className="fixed z-[60] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-xl border border-blue-100 bg-white p-4 text-slate-600 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        visibility: position.visible ? "visible" : "hidden",
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-xs font-bold text-slate-700">
          {ANNOTATIONS[id].title}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close annotation: ${ANNOTATIONS[id].title}`}
          className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-base text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ×
        </button>
      </div>
      <p className="text-xs leading-5">{ANNOTATIONS[id].text}</p>
    </div>,
    document.body,
  );
}
