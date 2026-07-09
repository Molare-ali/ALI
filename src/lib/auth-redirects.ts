import type { Customer } from "@/lib/types";

function isSafeInternalRedirect(redirect: string) {
  return redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.startsWith("/\\");
}

function defaultLoginRedirect(user: Customer) {
  return user.role === "admin" ? "/admin" : "/account";
}

export function resolveLoginRedirect(redirect: string | null, user: Customer) {
  if (!redirect || !isSafeInternalRedirect(redirect)) return defaultLoginRedirect(user);
  if (redirect.startsWith("/admin") && user.role !== "admin") return "/account";
  return redirect;
}

export function resolveRegisterRedirect(redirect: string | null, user: Customer) {
  if (!redirect || !isSafeInternalRedirect(redirect)) return "/account";
  if (redirect.startsWith("/admin") && user.role !== "admin") return "/account";
  return redirect;
}
