"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mutate, newId, readDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, requireUser } from "@/lib/session";
import { ownedEqub } from "@/lib/queries";
import { currentRound, eligibleMembers, isLocked, pickWinner } from "@/lib/equb";
import { safeNext } from "@/lib/redirect";
import {
  hasErrors,
  normalizePhone,
  text,
  validateEqub,
  validateMember,
  validateSignIn,
  validateSignUp,
} from "@/lib/validation";

async function updateEqub(equbId, change) {
  const user = await requireUser();
  const outcome = await mutate((db) => {
    const equb = ownedEqub(db, user.id, equbId);
    return equb ? { result: change(equb) } : null;
  });
  if (!outcome) notFound();
  revalidatePath(`/equbs/${equbId}`);
  return outcome.result;
}

export async function signUp(_prev, formData) {
  const values = { name: text(formData, "name"), email: text(formData, "email").toLowerCase() };
  const password = String(formData.get("password") ?? "");
  const errors = validateSignUp({ ...values, password });
  if (hasErrors(errors)) return { errors, values };

  const user = await mutate((db) => {
    if (db.users.some((u) => u.email === values.email)) return null;
    const created = { id: newId("usr"), ...values, passwordHash: hashPassword(password) };
    db.users.push(created);
    return created;
  });
  if (!user) return { errors: { email: "This email is already registered" }, values };

  await createSession(user.id);
  redirect("/equbs");
}

export async function signIn(_prev, formData) {
  const values = { email: text(formData, "email").toLowerCase() };
  const password = String(formData.get("password") ?? "");
  const errors = validateSignIn({ ...values, password });
  if (hasErrors(errors)) return { errors, values };

  const db = await readDb();
  const user = db.users.find((u) => u.email === values.email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { errors: { form: "Incorrect email or password" }, values };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

export async function createEqub(_prev, formData) {
  const user = await requireUser();
  const values = {
    name: text(formData, "name"),
    amount: text(formData, "amount"),
    frequency: text(formData, "frequency"),
    drawMethod: text(formData, "drawMethod"),
    startDate: text(formData, "startDate"),
  };
  const errors = validateEqub(values);
  if (hasErrors(errors)) return { errors, values };

  const id = newId("eqb");
  await mutate((db) => {
    db.equbs.push({
      id,
      ownerId: user.id,
      name: values.name,
      amount: Number(values.amount),
      frequency: values.frequency,
      drawMethod: values.drawMethod,
      startDate: values.startDate,
      members: [],
      rounds: [{ number: 1, payments: {}, winnerId: null, drawnAt: null }],
      createdAt: new Date().toISOString(),
    });
  });
  redirect(`/equbs/${id}`);
}

export async function addMember(equbId, _prev, formData) {
  const values = { name: text(formData, "name"), phone: text(formData, "phone") };
  const errors = validateMember(values);
  if (hasErrors(errors)) return { errors, values };

  const phone = normalizePhone(values.phone);
  const failure = await updateEqub(equbId, (equb) => {
    if (isLocked(equb)) return { form: "Members are locked once the first payment is recorded" };
    if (equb.members.some((member) => member.phone === phone)) {
      return { phone: "This phone number is already in the equb" };
    }
    equb.members.push({ id: newId("mem"), name: values.name, phone });
    return null;
  });

  if (failure) return { errors: failure, values };
  return { errors: {}, values: {}, message: `${values.name} was added` };
}

export async function removeMember(equbId, memberId) {
  await updateEqub(equbId, (equb) => {
    if (!isLocked(equb)) equb.members = equb.members.filter((member) => member.id !== memberId);
  });
}

export async function togglePayment(equbId, memberId) {
  await updateEqub(equbId, (equb) => {
    const round = currentRound(equb);
    if (!round || !equb.members.some((member) => member.id === memberId)) return;
    if (round.payments[memberId]) delete round.payments[memberId];
    else round.payments[memberId] = new Date().toISOString();
  });
}

export async function drawWinner(equbId) {
  await updateEqub(equbId, (equb) => {
    const round = currentRound(equb);
    const ready =
      round && equb.members.length >= 2 && equb.members.every((member) => round.payments[member.id]);
    if (!ready) return;
    round.winnerId = pickWinner(equb).id;
    round.drawnAt = new Date().toISOString();
    if (eligibleMembers(equb).length > 0) {
      equb.rounds.push({ number: round.number + 1, payments: {}, winnerId: null, drawnAt: null });
    }
  });
}

export async function deleteEqub(equbId) {
  const user = await requireUser();
  await mutate((db) => {
    db.equbs = db.equbs.filter((equb) => !(equb.id === equbId && equb.ownerId === user.id));
  });
  redirect("/equbs");
}