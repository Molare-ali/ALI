"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { resolveLoginRedirect } from "@/lib/auth-redirects";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(resolveLoginRedirect(redirect, user));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Login failed");
    }
  }

  return (
    <section className="luxury-container grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="glass-panel grid w-full max-w-lg gap-5 p-8">
        <div>
          <p className="fine-label text-plum">Customer Access</p>
          <h1 className="serif-title text-5xl text-aubergine">Log in</h1>
          <p className="mt-3 text-sm text-onyx/64">Please log in or create an account to complete your order.</p>
        </div>
        {error && <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Input label="Email" name="email" type="email" required />
        <Input label="Password" name="password" type="password" required />
        <Button type="submit">Log in</Button>
        <p className="text-sm text-onyx/66">New to Molarè? <Link className="font-semibold text-aubergine" href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}>Create an account</Link></p>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="luxury-container py-12 text-aubergine">Loading...</section>}>
      <LoginForm />
    </Suspense>
  );
}
