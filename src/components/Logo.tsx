"use client";

import { useState } from "react";

const requestedLogo = "/brand/molare-logo-new.jpg";
const availableLogo = "/brand/molare-logo-new.png";

export function Logo({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const [logoSrc, setLogoSrc] = useState(requestedLogo);

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
          onError={() => setLogoSrc(availableLogo)}
          className="h-full w-full object-cover"
        />
      </div>
      <span className={`serif-title ${inverted ? "text-ivory" : "text-aubergine"} ${compact ? "text-2xl" : "text-3xl"}`}>Molarè</span>
    </div>
  );
}
