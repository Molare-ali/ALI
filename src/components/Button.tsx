"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ElementType, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

const styles = {
  primary: "bg-aubergine text-ivory border-aubergine hover:bg-plum shadow-gold",
  secondary: "bg-transparent text-aubergine border-champagne hover:bg-champagne/15",
  ghost: "bg-transparent text-onyx border-transparent hover:text-plum"
};

const MotionButton = motion.button as ElementType;

export function Button({ href, variant = "primary", className = "", children, ...props }: ButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-none border px-5 py-3 text-sm font-semibold transition duration-300 ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <MotionButton whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.985 }} className={classes} {...props}>
      {children}
    </MotionButton>
  );
}
