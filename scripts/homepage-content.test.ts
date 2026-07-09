import assert from "node:assert/strict";
import {
  defaultHomepageContent,
  homepageContentRow,
  mapHomepageContent,
  normalizeHomepageContentInput
} from "../src/lib/homepage-content";
import { buildSiteAssetPath, validateSiteAssetImageFile } from "../src/lib/site-asset-upload";

const row = {
  id: "default",
  hero_image_url: "https://cdn.example.com/hero.webp",
  hero_kicker: "Edited Kicker",
  hero_title: "Edited Title",
  hero_subtitle: "Edited subtitle.",
  primary_cta_label: "Browse",
  primary_cta_href: "/shop",
  secondary_cta_label: "Talk to us",
  secondary_cta_href: "https://example.com/contact",
  feature_1_text: "First",
  feature_2_text: "Second",
  feature_3_text: "Third",
  updated_at: "2026-07-09T00:00:00.000Z"
};

{
  assert.deepEqual(mapHomepageContent(null), defaultHomepageContent);
  assert.deepEqual(mapHomepageContent(row), {
    heroImageUrl: "https://cdn.example.com/hero.webp",
    heroKicker: "Edited Kicker",
    heroTitle: "Edited Title",
    heroSubtitle: "Edited subtitle.",
    primaryCtaLabel: "Browse",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "Talk to us",
    secondaryCtaHref: "https://example.com/contact",
    feature1Text: "First",
    feature2Text: "Second",
    feature3Text: "Third"
  });
}

{
  const result = normalizeHomepageContentInput({
    heroImageUrl: "",
    heroKicker: " Seasonal edit ",
    heroTitle: " New Title ",
    heroSubtitle: " New subtitle. ",
    primaryCtaLabel: " Shop ",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: " Contact ",
    secondaryCtaHref: "https://example.com/contact",
    feature1Text: "",
    feature2Text: " Feature two ",
    feature3Text: ""
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.content, {
      ...defaultHomepageContent,
      heroKicker: "Seasonal edit",
      heroTitle: "New Title",
      heroSubtitle: "New subtitle.",
      primaryCtaLabel: "Shop",
      primaryCtaHref: "/shop",
      secondaryCtaLabel: "Contact",
      secondaryCtaHref: "https://example.com/contact",
      feature2Text: "Feature two"
    });
    assert.deepEqual(homepageContentRow(result.content), {
      id: "default",
      hero_image_url: "",
      hero_kicker: "Seasonal edit",
      hero_title: "New Title",
      hero_subtitle: "New subtitle.",
      primary_cta_label: "Shop",
      primary_cta_href: "/shop",
      secondary_cta_label: "Contact",
      secondary_cta_href: "https://example.com/contact",
      feature_1_text: "Aubergine tailoring",
      feature_2_text: "Feature two",
      feature_3_text: "Clean ivory restraint"
    });
  }
}

{
  const missingTitle = normalizeHomepageContentInput({ ...defaultHomepageContent, heroTitle: "" });
  assert.equal(missingTitle.ok, false);
  if (!missingTitle.ok) assert.equal(missingTitle.error, "Hero title is required.");

  const unsafeCta = normalizeHomepageContentInput({ ...defaultHomepageContent, primaryCtaHref: "javascript:alert(1)" });
  assert.equal(unsafeCta.ok, false);
  if (!unsafeCta.ok) assert.equal(unsafeCta.error, "CTA links must start with / or https://.");

  const protocolRelativeCta = normalizeHomepageContentInput({ ...defaultHomepageContent, primaryCtaHref: "//example.com" });
  assert.equal(protocolRelativeCta.ok, false);
  if (!protocolRelativeCta.ok) assert.equal(protocolRelativeCta.error, "CTA links must start with / or https://.");

  const unsafeImage = normalizeHomepageContentInput({ ...defaultHomepageContent, heroImageUrl: "/local-image.jpg" });
  assert.equal(unsafeImage.ok, false);
  if (!unsafeImage.ok) assert.equal(unsafeImage.error, "Hero image URL must be an http or https URL.");
}

{
  const file = new File([new Uint8Array([137, 80, 78, 71])], "hero.png", { type: "image/png" });
  const result = validateSiteAssetImageFile(file);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.file, file);

  const gif = validateSiteAssetImageFile(new File([new Uint8Array([71, 73, 70])], "hero.gif", { type: "image/gif" }));
  assert.equal(gif.ok, false);
  if (!gif.ok) assert.equal(gif.error, "Only JPEG, PNG, or WebP images are allowed.");

  const large = validateSiteAssetImageFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "hero.webp", { type: "image/webp" }));
  assert.equal(large.ok, false);
  if (!large.ok) assert.equal(large.error, "Image file must be 5MB or smaller.");

  assert.equal(buildSiteAssetPath("image/jpeg", 1700000000000, "abc123"), "homepage/1700000000000-abc123.jpg");
  assert.equal(buildSiteAssetPath("image/png", 1700000000000, "abc123"), "homepage/1700000000000-abc123.png");
  assert.equal(buildSiteAssetPath("image/webp", 1700000000000, "abc123"), "homepage/1700000000000-abc123.webp");
}

console.log("homepage content tests passed");
