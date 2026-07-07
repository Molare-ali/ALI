import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/user-auth";

type DbUser = {
  id: string;
  email: string;
  password: string | null;
  password_hash: string | null;
};

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env before running the migration.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env before running the migration.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  const { data, error } = await supabase.from("users").select("id, email, password, password_hash");
  if (error) throw new Error(`Failed to load users: ${error.message}`);

  const users = (data || []) as DbUser[];
  const usersWithPlaintext = users.filter((user) => user.password);
  let migrated = 0;
  let cleared = 0;

  for (const user of usersWithPlaintext) {
    const passwordHash = user.password_hash || await hashPassword(user.password || "");
    const { error: updateError } = await supabase.from("users").update({ password_hash: passwordHash, password: "" }).eq("id", user.id);
    if (updateError) throw new Error(`Failed to migrate user ${user.email}: ${updateError.message}`);
    if (!user.password_hash) migrated += 1;
    cleared += 1;
  }

  console.log(
    `Password hash migration complete. Migrated ${migrated} user${migrated === 1 ? "" : "s"} and cleared plaintext password values for ${cleared} user${cleared === 1 ? "" : "s"}.`
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Password hash migration failed: ${message}`);
  process.exit(1);
});
