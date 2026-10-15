import { readDb } from "@/lib/db";

export const ownedEqub = (db, ownerId, id) =>
  db.equbs.find((equb) => equb.id === id && equb.ownerId === ownerId) ?? null;

export async function listEqubs(ownerId) {
  const db = await readDb();
  return db.equbs.filter((equb) => equb.ownerId === ownerId);
}

export async function findEqub(ownerId, id) {
  return ownedEqub(await readDb(), ownerId, id);
}