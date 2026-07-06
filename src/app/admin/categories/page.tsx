"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { safeFetchJson } from "@/lib/api-client";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setCategories(await safeFetchJson<Category[]>("/api/categories"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await safeFetchJson<Category>(editing ? `/api/categories/${editing.id}` : "/api/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSuccess(editing ? "Category saved." : "Category added.");
      setEditing(null);
      formElement.reset();
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      setDeletingId(id);
      setError("");
      setSuccess("");
      await safeFetchJson<{ ok: boolean }>(`/api/categories/${id}`, { method: "DELETE" });
      setSuccess("Category deleted.");
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout title="Categories">
      {(error || success) && (
        <div className="mb-5 grid gap-3">
          {error && <AdminFeedback type="error" message={error} onDismiss={() => setError("")} />}
          {success && <AdminFeedback type="success" message={success} onDismiss={() => setSuccess("")} />}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form key={editing?.id || "new-category"} onSubmit={submit} className="grid gap-4 border border-champagne/30 bg-ivory p-5">
          <h2 className="serif-title text-3xl text-aubergine">{editing ? "Edit Category" : "Add Category"}</h2>
          <Input label="Category name" name="name" required defaultValue={editing?.name || ""} />
          <TextArea label="Description" name="description" required defaultValue={editing?.description || ""} />
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save Category" : "Add Category"}</Button>
            {editing && <Button type="button" variant="secondary" disabled={saving} onClick={() => setEditing(null)}>Cancel</Button>}
          </div>
        </form>
        <div className="grid gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-champagne/30 bg-ivory p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="serif-title text-3xl text-aubergine">{category.name}</h3>
                  <p className="mt-2 text-sm text-onyx/64">{category.description}</p>
                </div>
                <div className="flex gap-2">
                  <button disabled={saving || deletingId === category.id} onClick={() => { setError(""); setSuccess(""); setEditing(category); }} className="border border-champagne/40 px-3 py-2 text-sm text-aubergine disabled:cursor-not-allowed disabled:opacity-60">Edit</button>
                  <button disabled={deletingId === category.id} onClick={() => remove(category.id)} className="border border-red-300 px-3 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === category.id ? "Deleting..." : "Delete"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
