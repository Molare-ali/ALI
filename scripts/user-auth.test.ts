import assert from "node:assert/strict";
import {
  authErrorResponse,
  createSessionToken,
  getSessionCookieOptions,
  requireAdminFromSession,
  requireUserFromSession,
  verifySessionToken
} from "../src/lib/auth";
import { hashPassword, toSafeUser, verifyPassword } from "../src/lib/user-auth";

const user = {
  id: "user-1",
  fullName: "Test User",
  email: "Test@Example.COM",
  phone: "+963000000000",
  role: "customer" as const,
  passwordHash: "$2a$10$invalid"
};

async function main() {
{
  const safeUser = toSafeUser(user);
  assert.deepEqual(safeUser, {
    id: "user-1",
    fullName: "Test User",
    email: "Test@Example.COM",
    phone: "+963000000000",
    role: "customer"
  });
  assert.equal("passwordHash" in safeUser, false);
  assert.equal("password" in safeUser, false);
}

{
  const passwordHash = await hashPassword("secure-password");
  assert.equal(passwordHash.startsWith("$2"), true);
  assert.equal(await verifyPassword("secure-password", passwordHash), true);
  assert.equal(await verifyPassword("wrong-password", passwordHash), false);
}

{
  process.env.AUTH_SESSION_SECRET = "test-session-secret-with-enough-length";
  const safeUser = toSafeUser(user);
  const token = await createSessionToken(safeUser);
  const verifiedUser = await verifySessionToken(token);

  assert.deepEqual(verifiedUser, safeUser);
  assert.equal("passwordHash" in verifiedUser!, false);
  assert.equal("password" in verifiedUser!, false);
  assert.equal(await verifySessionToken(`${token}tampered`), null);
}

{
  const productionOptions = getSessionCookieOptions("production");
  assert.equal(productionOptions.httpOnly, true);
  assert.equal(productionOptions.sameSite, "lax");
  assert.equal(productionOptions.secure, true);
  assert.equal(typeof productionOptions.maxAge, "number");

  const developmentOptions = getSessionCookieOptions("development");
  assert.equal(developmentOptions.secure, false);
}

{
  assert.deepEqual(requireUserFromSession(toSafeUser(user)), toSafeUser(user));

  const adminUser = { ...toSafeUser(user), role: "admin" as const };
  assert.deepEqual(requireAdminFromSession(adminUser), adminUser);

  assert.throws(() => requireUserFromSession(null), { status: 401, message: "Authentication required." });
  assert.throws(() => requireAdminFromSession(toSafeUser(user)), { status: 403, message: "Admin access required." });

  const unauthenticated = authErrorResponse(() => requireUserFromSession(null));
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await unauthenticated.json(), { error: "Authentication required." });

  const forbidden = authErrorResponse(() => requireAdminFromSession(toSafeUser(user)));
  assert.equal(forbidden.status, 403);
  assert.deepEqual(await forbidden.json(), { error: "Admin access required." });
}

console.log("user auth tests passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
