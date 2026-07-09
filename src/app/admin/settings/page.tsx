"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminEmptyState, AdminLayout, AdminSectionCard } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { safeFetchJson } from "@/lib/api-client";
import type { HomepageContent, StoreSettings } from "@/lib/types";

function HeroImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (!url) {
    return (
      <div className="grid aspect-[16/9] place-items-center border border-dashed border-aubergine/35 bg-linen/50 p-5 text-center text-sm text-onyx/55">
        No custom hero image selected.
      </div>
    );
  }

  if (failed) {
    return (
      <div className="grid aspect-[16/9] place-items-center border border-red-300 bg-red-50 p-5 text-center text-sm text-red-700">
        Hero image preview unavailable.
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-aubergine/30 bg-linen">
      <img src={url} alt="Homepage hero preview" onError={() => setFailed(true)} className="aspect-[16/9] w-full object-cover" />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      safeFetchJson<StoreSettings>("/api/settings"),
      safeFetchJson<HomepageContent>("/api/homepage-content")
    ])
      .then(([nextSettings, nextHomepageContent]) => {
        setSettings(nextSettings);
        setHomepageContent(nextHomepageContent);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load settings."));
  }, []);

  function updateHomepageField(field: keyof HomepageContent, value: string) {
    setHomepageContent((current) => current ? { ...current, [field]: value } : current);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const nextSettings = await safeFetchJson<StoreSettings>("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSettings(nextSettings);
      setSuccess("Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadHeroImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingHeroImage(true);
      setError("");
      setSuccess("");
      const result = await safeFetchJson<{ url: string }>("/api/admin/upload/site-asset", {
        method: "POST",
        body: formData
      });
      updateHomepageField("heroImageUrl", result.url);
      setSuccess("Hero image uploaded. Save homepage content to publish it.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload hero image.");
    } finally {
      setUploadingHeroImage(false);
      event.target.value = "";
    }
  }

  async function submitHomepageContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!homepageContent) return;

    try {
      setSavingHomepage(true);
      setError("");
      setSuccess("");
      const nextHomepageContent = await safeFetchJson<HomepageContent>("/api/admin/homepage-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homepageContent)
      });
      setHomepageContent(nextHomepageContent);
      setSuccess("Homepage content saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save homepage content.");
    } finally {
      setSavingHomepage(false);
    }
  }

  return (
    <AdminLayout title="Settings">
      {(error || success) && (
        <div className="mb-5 grid gap-3">
          {error && <AdminFeedback type="error" message={error} onDismiss={() => setError("")} />}
          {success && <AdminFeedback type="success" message={success} onDismiss={() => setSuccess("")} />}
        </div>
      )}
      {(!settings || !homepageContent) && !error && <AdminEmptyState title="Loading settings" message="Store settings are being loaded from the admin API." />}
      {settings && homepageContent && (
        <div className="grid gap-6">
          <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-6">
              <AdminSectionCard title="Contact" eyebrow="Customer Channels" description="Primary contact details shown to customers and used for order conversations.">
                <div className="grid gap-4 md:grid-cols-3">
                  <Input label="WhatsApp number" name="whatsappNumber" required defaultValue={settings.whatsappNumber} />
                  <Input label="Contact phone" name="contactPhone" required defaultValue={settings.contactPhone} />
                  <Input label="Contact email" name="contactEmail" type="email" required defaultValue={settings.contactEmail} />
                </div>
              </AdminSectionCard>

              <AdminSectionCard title="Store Details" eyebrow="Location" description="Keep the public store address concise and readable.">
                <Input label="Store address" name="storeAddress" required defaultValue={settings.storeAddress} />
              </AdminSectionCard>
            </div>

            <AdminSectionCard title="Social Links" eyebrow="Brand Presence" description="Optional channels surfaced in the storefront footer." className="self-start">
              <div className="grid gap-4">
                <Input label="Instagram link" name="instagramLink" defaultValue={settings.instagramLink} />
                <Input label="Facebook link" name="facebookLink" defaultValue={settings.facebookLink} />
                <Input label="TikTok link" name="tiktokLink" defaultValue={settings.tiktokLink} />
                <Input label="Snapchat link" name="snapchatLink" defaultValue={settings.snapchatLink} />
              </div>
              <div className="mt-6 border-t border-aubergine/25 pt-5">
                <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : "Save Settings"}</Button>
              </div>
            </AdminSectionCard>
          </form>

          <form onSubmit={submitHomepageContent}>
            <AdminSectionCard title="Homepage Content" eyebrow="Storefront Hero" description="Edit the homepage hero image, copy, calls to action, and feature text.">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="grid content-start gap-4">
                  <HeroImagePreview key={homepageContent.heroImageUrl} url={homepageContent.heroImageUrl} />
                  <Input
                    label="Hero image URL"
                    value={homepageContent.heroImageUrl}
                    onChange={(event) => updateHomepageField("heroImageUrl", event.target.value)}
                    placeholder="https://..."
                  />
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-aubergine/50 bg-ivory px-4 text-sm font-semibold text-aubergine transition hover:bg-softPurple/10">
                    <ImagePlus size={17} />
                    {uploadingHeroImage ? "Uploading..." : "Upload Hero Image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={uploadingHeroImage}
                      onChange={uploadHeroImage}
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <Input label="Kicker" value={homepageContent.heroKicker} onChange={(event) => updateHomepageField("heroKicker", event.target.value)} />
                  <Input label="Title" required value={homepageContent.heroTitle} onChange={(event) => updateHomepageField("heroTitle", event.target.value)} />
                  <TextArea label="Subtitle" required value={homepageContent.heroSubtitle} onChange={(event) => updateHomepageField("heroSubtitle", event.target.value)} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Primary button label" value={homepageContent.primaryCtaLabel} onChange={(event) => updateHomepageField("primaryCtaLabel", event.target.value)} />
                    <Input label="Primary button link" value={homepageContent.primaryCtaHref} onChange={(event) => updateHomepageField("primaryCtaHref", event.target.value)} />
                    <Input label="Secondary button label" value={homepageContent.secondaryCtaLabel} onChange={(event) => updateHomepageField("secondaryCtaLabel", event.target.value)} />
                    <Input label="Secondary button link" value={homepageContent.secondaryCtaHref} onChange={(event) => updateHomepageField("secondaryCtaHref", event.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input label="Feature 1 text" value={homepageContent.feature1Text} onChange={(event) => updateHomepageField("feature1Text", event.target.value)} />
                    <Input label="Feature 2 text" value={homepageContent.feature2Text} onChange={(event) => updateHomepageField("feature2Text", event.target.value)} />
                    <Input label="Feature 3 text" value={homepageContent.feature3Text} onChange={(event) => updateHomepageField("feature3Text", event.target.value)} />
                  </div>
                  <div className="border-t border-aubergine/25 pt-5">
                    <Button type="submit" disabled={savingHomepage}>{savingHomepage ? "Saving..." : "Save Homepage Content"}</Button>
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
