import type { HomepageContent } from "@/lib/types";

export type DbHomepageContent = {
  id: string;
  hero_image_url: string;
  hero_kicker: string;
  hero_title: string;
  hero_subtitle: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  feature_1_text: string;
  feature_2_text: string;
  feature_3_text: string;
  updated_at?: string;
};

export type HomepageContentValidationResult =
  | { ok: true; content: HomepageContent }
  | { ok: false; error: string };

export const defaultHomepageContent: HomepageContent = {
  heroImageUrl: "",
  heroKicker: "LUXURY ITALIAN SARTORIAL FASHION",
  heroTitle: "Refined Clothing for a Modern Wardrobe",
  heroSubtitle: "Sartorial elegance, polished into character.",
  primaryCtaLabel: "Shop Collection",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "Contact Us",
  secondaryCtaHref: "/contact",
  feature1Text: "Aubergine tailoring",
  feature2Text: "Purple accents",
  feature3Text: "Clean ivory restraint"
};

function text(value: unknown) {
  return String(value || "").trim();
}

function fallbackText(value: unknown, fallback: string) {
  return text(value) || fallback;
}

function isSafeCtaHref(value: string) {
  return (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) || value.startsWith("https://");
}

function isHttpUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function mapHomepageContent(row: DbHomepageContent | null): HomepageContent {
  if (!row) return defaultHomepageContent;
  return {
    heroImageUrl: row.hero_image_url || "",
    heroKicker: row.hero_kicker || defaultHomepageContent.heroKicker,
    heroTitle: row.hero_title || defaultHomepageContent.heroTitle,
    heroSubtitle: row.hero_subtitle || defaultHomepageContent.heroSubtitle,
    primaryCtaLabel: row.primary_cta_label || defaultHomepageContent.primaryCtaLabel,
    primaryCtaHref: row.primary_cta_href || defaultHomepageContent.primaryCtaHref,
    secondaryCtaLabel: row.secondary_cta_label || defaultHomepageContent.secondaryCtaLabel,
    secondaryCtaHref: row.secondary_cta_href || defaultHomepageContent.secondaryCtaHref,
    feature1Text: row.feature_1_text || defaultHomepageContent.feature1Text,
    feature2Text: row.feature_2_text || defaultHomepageContent.feature2Text,
    feature3Text: row.feature_3_text || defaultHomepageContent.feature3Text
  };
}

export function normalizeHomepageContentInput(input: Partial<Record<keyof HomepageContent, unknown>>): HomepageContentValidationResult {
  const content: HomepageContent = {
    heroImageUrl: text(input.heroImageUrl),
    heroKicker: fallbackText(input.heroKicker, defaultHomepageContent.heroKicker),
    heroTitle: text(input.heroTitle),
    heroSubtitle: text(input.heroSubtitle),
    primaryCtaLabel: fallbackText(input.primaryCtaLabel, defaultHomepageContent.primaryCtaLabel),
    primaryCtaHref: fallbackText(input.primaryCtaHref, defaultHomepageContent.primaryCtaHref),
    secondaryCtaLabel: fallbackText(input.secondaryCtaLabel, defaultHomepageContent.secondaryCtaLabel),
    secondaryCtaHref: fallbackText(input.secondaryCtaHref, defaultHomepageContent.secondaryCtaHref),
    feature1Text: fallbackText(input.feature1Text, defaultHomepageContent.feature1Text),
    feature2Text: fallbackText(input.feature2Text, defaultHomepageContent.feature2Text),
    feature3Text: fallbackText(input.feature3Text, defaultHomepageContent.feature3Text)
  };

  if (!content.heroTitle) return { ok: false, error: "Hero title is required." };
  if (!content.heroSubtitle) return { ok: false, error: "Hero subtitle is required." };
  if (!isSafeCtaHref(content.primaryCtaHref) || !isSafeCtaHref(content.secondaryCtaHref)) {
    return { ok: false, error: "CTA links must start with / or https://." };
  }
  if (!isHttpUrl(content.heroImageUrl)) {
    return { ok: false, error: "Hero image URL must be an http or https URL." };
  }

  return { ok: true, content };
}

export function homepageContentRow(content: HomepageContent) {
  return {
    id: "default",
    hero_image_url: content.heroImageUrl,
    hero_kicker: content.heroKicker,
    hero_title: content.heroTitle,
    hero_subtitle: content.heroSubtitle,
    primary_cta_label: content.primaryCtaLabel,
    primary_cta_href: content.primaryCtaHref,
    secondary_cta_label: content.secondaryCtaLabel,
    secondary_cta_href: content.secondaryCtaHref,
    feature_1_text: content.feature1Text,
    feature_2_text: content.feature2Text,
    feature_3_text: content.feature3Text
  };
}
