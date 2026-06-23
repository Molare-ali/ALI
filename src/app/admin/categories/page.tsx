"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);

  async function load() {
    const response = await fetch("/api/categories");
    setCategories(await response.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    await fetch(editing ? `/api/categories/${editing.id}` : "/api/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setEditing(null);
    event.currentTarget.reset();
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <AdminLayout title="Categories">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form key={editing?.id || "new-category"} onSubmit={submit} className="grid gap-4 border border-champagne/30 bg-ivory p-5">
          <h2 className="serif-title text-3xl text-aubergine">{editing ? "Edit Category" : "Add Category"}</h2>
          <Input label="Category name" name="name" required defaultValue={editing?.name || ""} />
          <TextArea label="Description" name="description" required defaultValue={editing?.description || ""} />
          <div className="flex gap-3">
            <Button type="submit">{editing ? "Save Category" : "Add Category"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>}
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
                  <button onClick={() => setEditing(category)} className="border border-champagne/40 px-3 py-2 text-sm text-aubergine">Edit</button>
                  <button onClick={() => remove(category.id)} className="border border-red-300 px-3 py-2 text-sm text-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
