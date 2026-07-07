"use client";

import { Facebook, Instagram, Music2, Send } from "lucide-react";
import { motion } from "framer-motion";
import type { StoreSettings } from "@/lib/types";

export function SocialLinks({ settings, inverted = false }: { settings: StoreSettings; inverted?: boolean }) {
  const links = [
    { href: settings.instagramLink, label: "Instagram", Icon: Instagram },
    { href: settings.facebookLink, label: "Facebook", Icon: Facebook },
    { href: settings.tiktokLink, label: "TikTok", Icon: Music2 },
    { href: settings.snapchatLink, label: "Snapchat", Icon: Send }
  ].filter((item) => item.href);

  if (!links.length) return null;

  return (
    <div className="flex items-center gap-3">
      {links.map(({ href, label, Icon }) => (
        <motion.a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noreferrer"
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className={`grid h-10 w-10 place-items-center border transition ${
            inverted
              ? "border-ivory/35 text-ivory hover:bg-ivory hover:text-aubergine"
              : "border-aubergine/45 text-aubergine hover:bg-aubergine hover:text-ivory"
          }`}
        >
          <Icon size={18} />
        </motion.a>
      ))}
    </div>
  );
}
