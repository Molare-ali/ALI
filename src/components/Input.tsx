import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-onyx/80">
      <span className="fine-label text-aubergine">{label}</span>
      <input
        className={`min-h-12 border border-smoke bg-ivory px-4 py-3 text-onyx outline-none transition focus:border-aubergine focus:ring-2 focus:ring-deepPurple/20 ${className}`}
        {...props}
      />
    </label>
  );
}

export function TextArea({ label, className = "", ...props }: TextAreaProps) {
  return (
    <label className="grid gap-2 text-sm text-onyx/80">
      <span className="fine-label text-aubergine">{label}</span>
      <textarea
        className={`min-h-28 border border-smoke bg-ivory px-4 py-3 text-onyx outline-none transition focus:border-aubergine focus:ring-2 focus:ring-deepPurple/20 ${className}`}
        {...props}
      />
    </label>
  );
}
