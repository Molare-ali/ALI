"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminLayout } from "@/components/AdminLayout";
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
      {settings && (
        <form onSubmit={submit} className="grid max-w-3xl gap-5 border border-champagne/30 bg-ivory p-6 shadow-sm">
          <Input label="WhatsApp number" name="whatsappNumber" required defaultValue={settings.whatsappNumber} />
          <Input label="Contact phone" name="contactPhone" required defaultValue={settings.contactPhone} />
          <Input label="Contact email" name="contactEmail" type="email" required defaultValue={settings.contactEmail} />
          <Input label="Store address" name="storeAddress" required defaultValue={settings.storeAddress} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Instagram link" name="instagramLink" defaultValue={settings.instagramLink} />
            <Input label="Facebook link" name="facebookLink" defaultValue={settings.facebookLink} />
            <Input label="TikTok link" name="tiktokLink" defaultValue={settings.tiktokLink} />
            <Input label="Snapchat link" name="snapchatLink" defaultValue={settings.snapchatLink} />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
        </form>
      )}
    </AdminLayout>
  );
}
