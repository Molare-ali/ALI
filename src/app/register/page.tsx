"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/checkout";
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await register({
        fullName: String(form.get("fullName")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        password: String(form.get("password"))
      });
      router.push(redirect);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Registration failed");
    }
  }

  return (
    <section className="luxury-container grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="glass-panel grid w-full max-w-lg gap-5 p-8">
        <div>
          <p className="fine-label text-plum">Join Molarè</p>
          <h1 className="serif-title text-5xl text-aubergine">Create account</h1>
        </div>
        {error && <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Input label="Full name" name="fullName" required />
        <Input label="Email" name="email" type="email" required />
        <Input label="Phone" name="phone" />
        <Input label="Password" name="password" type="password" required minLength={6} />
        <Button type="submit">Create account</Button>
        <p className="text-sm text-onyx/66">Already registered? <Link className="font-semibold text-aubergine" href={`/login?redirect=${encodeURIComponent(redirect)}`}>Log in</Link></p>
      </form>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<section className="luxury-container py-12 text-aubergine">Loading...</section>}>
      <RegisterForm />
    </Suspense>
  );
}
