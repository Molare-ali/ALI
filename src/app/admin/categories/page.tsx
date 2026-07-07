"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminCard, AdminEmptyState, AdminLayout, AdminSectionCard, AdminStatusBadge } from "@/components/AdminLayout";
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
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <AdminSectionCard
          title={editing ? "Edit Category" : "Add Category"}
          eyebrow="Category Editor"
          description="Create concise collection groups that help shoppers browse the catalog."
          className="self-start"
        >
          <form key={editing?.id || "new-category"} onSubmit={submit} className="grid min-w-0 content-start gap-4">
            <Input label="Category name" name="name" required defaultValue={editing?.name || ""} />
            <TextArea label="Description" name="description" required defaultValue={editing?.description || ""} className="min-h-32 resize-y" />
            <div className="flex flex-wrap gap-3 border-t border-aubergine/25 pt-5">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save Category" : "Add Category"}</Button>
              {editing && <Button type="button" variant="secondary" disabled={saving} onClick={() => setEditing(null)}>Cancel</Button>}
            </div>
          </form>
        </AdminSectionCard>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-aubergine/25 pb-4">
            <div>
              <p className="fine-label text-plum">Collection List</p>
              <h2 className="serif-title text-3xl leading-tight text-aubergine">Existing Categories</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-onyx/62">Edit display names and descriptions without changing category routes.</p>
            </div>
            <AdminStatusBadge tone="muted">{categories.length} total</AdminStatusBadge>
          </div>
          <div className="grid gap-4">
            {categories.length === 0 && <AdminEmptyState title="No categories yet" message="Add a category to start organizing storefront products." />}
            {categories.map((category) => (
              <AdminCard key={category.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="serif-title text-3xl text-aubergine">{category.name}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-onyx/64">{category.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={saving || deletingId === category.id} onClick={() => { setError(""); setSuccess(""); setEditing(category); }} className="min-h-10 border border-aubergine/50 px-4 text-sm font-semibold text-aubergine transition hover:bg-softPurple/10 disabled:cursor-not-allowed disabled:opacity-60">Edit</button>
                    <button disabled={deletingId === category.id} onClick={() => remove(category.id)} className="min-h-10 border border-red-300 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === category.id ? "Deleting..." : "Delete"}</button>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
