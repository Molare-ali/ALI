"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { StoreSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((response) => response.json()).then(setSettings);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSettings(await response.json());
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <AdminLayout title="Settings">
      {settings && (
        <form onSubmit={submit} className="grid max-w-3xl gap-5 border border-champagne/30 bg-ivory p-6 shadow-sm">
          {saved && <p className="border border-champagne/40 bg-champagne/15 px-4 py-3 text-sm text-aubergine">Settings saved.</p>}
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
          <Button type="submit">Save Settings</Button>
        </form>
      )}
    </AdminLayout>
  );
}
