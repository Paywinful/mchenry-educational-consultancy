"use client";

import React from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

/** Toast types */
type ToastKind = "success" | "error" | "info" | "warning";

type ToastInput =
  | string
  | {
      title?: string;
      description?: string;
      kind?: ToastKind;
      duration?: number; // ms
    };

type ToastItem = {
  id: string;
  kind: ToastKind;
  title?: string;
  description?: string;
  duration: number;
};

/** Internal event name for broadcasting toasts */
const EV = "app:toast";

/** Imperative API you can import anywhere: toast.success("...") etc. */
function dispatchToast(payload: ToastInput) {
  if (typeof window === "undefined") return;
  const normalized: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: typeof payload === "string" ? "info" : payload.kind ?? "info",
    title: typeof payload === "string" ? payload : payload.title,
    description: typeof payload === "string" ? undefined : payload.description,
    duration:
      typeof payload === "string"
        ? 4000
        : Math.max(1200, Math.min(payload.duration ?? 4000, 15000)),
  };
  window.dispatchEvent(new CustomEvent(EV, { detail: normalized }));
}

/** Named helpers */
export const toast = Object.assign(dispatchToast, {
  success: (message: string, opts: Omit<ToastInput, "kind"> = {}) =>
    dispatchToast({ ...(typeof opts === "string" ? { title: opts } : opts), title: message, kind: "success" }),
  error: (message: string, opts: Omit<ToastInput, "kind"> = {}) =>
    dispatchToast({ ...(typeof opts === "string" ? { title: opts } : opts), title: message, kind: "error" }),
  info: (message: string, opts: Omit<ToastInput, "kind"> = {}) =>
    dispatchToast({ ...(typeof opts === "string" ? { title: opts } : opts), title: message, kind: "info" }),
  warning: (message: string, opts: Omit<ToastInput, "kind"> = {}) =>
    dispatchToast({ ...(typeof opts === "string" ? { title: opts } : opts), title: message, kind: "warning" }),
});

/** Visual container — render this once at the app root */
export default function Toasts() {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<ToastItem>).detail;
      setItems((prev) => [detail, ...prev]);
      // auto-remove
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== detail.id));
      }, detail.duration);
    }
    window.addEventListener(EV, onToast as EventListener);
    return () => window.removeEventListener(EV, onToast as EventListener);
  }, []);

  function dismiss(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="fixed z-[99999] top-4 right-4 w-full max-w-sm space-y-2">
      {items.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const { kind, title, description, duration } = item;

  const color =
    kind === "success"
      ? "bg-green-600"
      : kind === "error"
      ? "bg-red-600"
      : kind === "warning"
      ? "bg-yellow-600"
      : "bg-blue-600";

  const Icon =
    kind === "success"
      ? CheckCircle
      : kind === "error"
      ? AlertTriangle
      : kind === "warning"
      ? AlertTriangle
      : Info;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto overflow-hidden rounded-lg shadow-lg bg-white border border-gray-200"
    >
      <div className="p-3 flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-1 ${color} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium text-sm">{title}</p>}
          {description && (
            <p className="text-xs text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      {/* progress */}
      <div className="h-1 w-full bg-gray-100 relative overflow-hidden">
        <div
          className={`${color} absolute left-0 top-0 h-full`}
          style={{
            width: "100%",
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      </div>
      <style jsx>{`
        @keyframes toast-progress {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
