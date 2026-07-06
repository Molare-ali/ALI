"use client";

import { X } from "lucide-react";

type AdminFeedbackProps = {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
};

const styles = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  error: "border-red-300 bg-red-50 text-red-700"
};

export function AdminFeedback({ type, message, onDismiss }: AdminFeedbackProps) {
  if (!message) return null;

  return (
    <div className={`flex items-start justify-between gap-4 border px-4 py-3 text-sm ${styles[type]}`} role={type === "error" ? "alert" : "status"}>
      <p>{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="grid h-6 w-6 shrink-0 place-items-center opacity-70 transition hover:opacity-100" aria-label="Dismiss message">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
