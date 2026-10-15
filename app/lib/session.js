import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { readDb } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";

const maxAge = 60 * 60 * 24 * 7;

function sign(value) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export async function createSession(userId) {
  const payload = `${userId}.${Date.now() + maxAge * 1000}`;
  const store = await cookies();
  store.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [userId, expires, signature = ""] = token.split(".");
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(`${userId}.${expires}`));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (Number(expires) < Date.now()) return null;
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  return user ? { id: user.id, name: user.name, email: user.email } : null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/signin");
  return user;
}