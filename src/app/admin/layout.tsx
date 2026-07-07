import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "admin") redirect("/login");

  return <div className="admin-route">{children}</div>;
}
