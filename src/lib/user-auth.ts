import bcrypt from "bcryptjs";
import type { Customer } from "./types";

const passwordSaltRounds = 10;

export type UserAuthRecord = Customer & {
  passwordHash: string | null;
};

export function toSafeUser(user: Customer): Customer {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role
  };
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, passwordSaltRounds);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
