"use client";

import { useState } from "react";

const logoPng = "/brand/molare-logo-new.png";
const fallbackLogo = "/brand/molare-logo.svg";

export function Logo({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const [logoSrc, setLogoSrc] = useState(logoPng);

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative overflow-hidden border bg-brandBlack shadow-purple ${
          inverted ? "border-ivory/20" : "border-aubergine/20"
        } ${compact ? "h-10 w-10" : "h-12 w-12"}`}
      >
        <img
          src={logoSrc}
          alt="Molare logo"
          onError={() => {
            if (logoSrc !== fallbackLogo) setLogoSrc(fallbackLogo);
          }}
          className="h-full w-full object-contain p-1"
        />
      </div>
      <span className={`serif-title ${inverted ? "text-ivory" : "text-aubergine"} ${compact ? "text-2xl" : "text-3xl"}`}>Molarè</span>
    </div>
  );
}
