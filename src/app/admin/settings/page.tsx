"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminEmptyState, AdminLayout, AdminSectionCard } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { safeFetchJson } from "@/lib/api-client";
import type { StoreSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    safeFetchJson<StoreSettings>("/api/settings")
      .then(setSettings)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load settings."));
  }, []);

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

  return (
    <AdminLayout title="Settings">
      {(error || success) && (
        <div className="mb-5 grid gap-3">
          {error && <AdminFeedback type="error" message={error} onDismiss={() => setError("")} />}
          {success && <AdminFeedback type="success" message={success} onDismiss={() => setSuccess("")} />}
        </div>
      )}
      {!settings && !error && <AdminEmptyState title="Loading settings" message="Store settings are being loaded from the admin API." />}
      {settings && (
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
            <div className="mt-6 border-t border-champagne/25 pt-5">
              <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : "Save Settings"}</Button>
            </div>
          </AdminSectionCard>
        </form>
      )}
    </AdminLayout>
  );
}
