"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mutate, newId, readDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, requireUser } from "@/lib/session";
import { ownedEqub } from "@/lib/queries";
import {currentRound,eligibleMembers,isLocked,pickWinner,potOf,roundContributionAmount} from "@/lib/equb";
import { getPlanById } from "@/lib/plans";
import { safeNext } from "@/lib/redirect";
import {
  hasErrors,
  normalizePhone,
  text,
  validateEqub,
  validateMember,
  validatePayment,
  validateSignIn,
  validateSignUp,
} from "@/lib/validation";

async function updateEqub(equbId, change) {
  const user = await requireUser();
  const outcome = await mutate((db) => {
    const equb = ownedEqub(db, user.id, equbId);
    if (!equb) return null;
    const res = change(equb, user);
    return { result: res };
  });
  if (!outcome) notFound();
  revalidatePath(`/equbs/${equbId}`);
  revalidatePath("/equbs");
  revalidatePath("/dashboard");
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
  const planId = text(formData, "planId");
  const selectedPlan = getPlanById(planId);

  const values = {
    name: text(formData, "name"),
    amount: selectedPlan ? String(selectedPlan.contributionAmount) : text(formData, "amount"),
    frequency: selectedPlan ? selectedPlan.frequency : text(formData, "frequency"),
    drawMethod: text(formData, "drawMethod") || "lottery",
    startDate: text(formData, "startDate"),
    maxMembers: text(formData, "maxMembers") || (selectedPlan ? String(selectedPlan.maxMembers) : "50"),
  };

  const errors = validateEqub(values);
  if (hasErrors(errors)) return { errors, values };

  const id = newId("eqb");
  await mutate((db) => {
    db.equbs.push({
      id,
      ownerId: user.id,
      planId: planId || null,
      name: values.name,
      amount: Number(values.amount),
      frequency: values.frequency,
      drawMethod: values.drawMethod,
      startDate: values.startDate,
      maxMembers: Number(values.maxMembers) || 50,
      currentCycle: 1,
      drawPaused: false,
      members: [],
      rounds: [{ number: 1, cycle: 1, payments: {}, winnerId: null, drawnAt: null }],
      payouts: [],
      completedCycles: [],
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
    if (isLocked(equb)) return { form: "Members roster is locked once the first payment is recorded" };
    const limit = equb.maxMembers || 50;
    if (equb.members.length >= limit) {
      return { form: `Maximum capacity of ${limit} members has been reached for this Equb plan` };
    }
    if (equb.members.some((member) => member.phone === phone)) {
      return { phone: "This phone number is already registered in this Equb" };
    }
    equb.members.push({ id: newId("mem"), name: values.name, phone });
    return null;
  });

  if (failure) return { errors: failure, values };
  return { errors: {}, values: {}, message: `${values.name} was successfully registered` };
}

export async function removeMember(equbId, memberId) {
  await updateEqub(equbId, (equb) => {
    if (!isLocked(equb)) {
      equb.members = equb.members.filter((member) => member.id !== memberId);
    }
  });
}

export async function togglePayment(equbId, memberId) {
  const user = await requireUser();
  await updateEqub(equbId, (equb) => {
    const round = currentRound(equb);
    if (!round || !equb.members.some((member) => member.id === memberId)) return;
    if (!round.payments) round.payments = {};

    const existing = round.payments[memberId];
    if (existing) {
      delete round.payments[memberId];
    } else {
      const requiredAmount = roundContributionAmount(equb);
      round.payments[memberId] = {
        status: "paid",
        amountPaid: requiredAmount,
        amountDue: requiredAmount,
        paymentDate: new Date().toISOString(),
        transactionRef: "",
        recordedBy: user.name,
      };
    }
  });
}

export async function recordDetailedPayment(equbId, _prev, formData) {
  const user = await requireUser();
  const memberId = text(formData, "memberId");
  const amountPaid = text(formData, "amountPaid");
  const status = text(formData, "status") || "paid";
  const transactionRef = text(formData, "transactionRef");

  const errors = validatePayment({ amountPaid, status, transactionRef });
  if (hasErrors(errors)) return { errors };

  await updateEqub(equbId, (equb) => {
    const round = currentRound(equb);
    if (!round || !equb.members.some((member) => member.id === memberId)) return;
    if (!round.payments) round.payments = {};

    const due = roundContributionAmount(equb);
    const paidVal = Number(amountPaid);

    round.payments[memberId] = {
      status: paidVal >= due ? "paid" : paidVal > 0 ? "partially_paid" : status,
      amountPaid: paidVal,
      amountDue: due,
      paymentDate: new Date().toISOString(),
      transactionRef: transactionRef || "",
      recordedBy: user.name,
    };
  });

  return { success: true };
}

export async function toggleDrawPause(equbId) {
  await updateEqub(equbId, (equb) => {
    equb.drawPaused = !Boolean(equb.drawPaused);
  });
}

export async function drawWinner(equbId) {
  await updateEqub(equbId, (equb) => {
    if (equb.drawPaused) return;
    const round = currentRound(equb);
    if (!round) return;

    const eligible = eligibleMembers(equb);
    if (eligible.length === 0 || equb.members.length < 2) return;

    // Pick winner fairly
    const winner = pickWinner(equb);
    if (!winner) return;

    // Server-side check: ensure winner hasn't won in current cycle
    const currentCycleNum = equb.currentCycle ?? 1;
    const pastWinnersInCycle = equb.rounds
      .filter((r) => (r.cycle ?? 1) === currentCycleNum && r.winnerId)
      .map((r) => r.winnerId);

    if (pastWinnersInCycle.includes(winner.id)) {
      throw new Error("Concurrency error: Member has already won in this cycle.");
    }

    round.winnerId = winner.id;
    round.drawnAt = new Date().toISOString();
    round.cycle = currentCycleNum;

    const potAmount = potOf(equb);
    if (!equb.payouts) equb.payouts = [];
    equb.payouts.push({
      id: newId("pay"),
      roundNumber: round.number,
      cycleNumber: currentCycleNum,
      winnerId: winner.id,
      winnerName: winner.name,
      potAmount,
      drawnAt: round.drawnAt,
      payoutStatus: "pending",
      payoutDate: null,
      transactionRef: "",
      notes: "Awaiting organizer verification and payout release.",
    });

    // If more eligible members remain in this cycle, queue next round
    const remainingEligible = equb.members.filter(
      (m) => ![...pastWinnersInCycle, winner.id].includes(m.id)
    );

    if (remainingEligible.length > 0) {
      equb.rounds.push({
        number: round.number + 1,
        cycle: currentCycleNum,
        payments: {},
        winnerId: null,
        drawnAt: null,
      });
    }
  });
}

export async function startNewCycle(equbId) {
  await updateEqub(equbId, (equb) => {
    const currentCycleNum = equb.currentCycle ?? 1;
    const eligible = eligibleMembers(equb);

    // Only allow starting new cycle when all members have won in current cycle
    if (eligible.length > 0 || equb.members.length < 2) return;

    if (!equb.completedCycles) equb.completedCycles = [];
    equb.completedCycles.push({
      cycleNumber: currentCycleNum,
      completedAt: new Date().toISOString(),
      totalRounds: equb.members.length,
      memberCount: equb.members.length,
      totalPotDistributed: potOf(equb) * equb.members.length,
    });

    const nextCycleNum = currentCycleNum + 1;
    equb.currentCycle = nextCycleNum;
    equb.drawPaused = false;

    // Reset round 1 for the new cycle
    equb.rounds.push({
      number: 1,
      cycle: nextCycleNum,
      payments: {},
      winnerId: null,
      drawnAt: null,
    });
  });
}

export async function updatePayoutStatus(equbId, payoutId, _prev, formData) {
  const status = text(formData, "payoutStatus");
  const transactionRef = text(formData, "transactionRef");
  const notes = text(formData, "notes");

  await updateEqub(equbId, (equb) => {
    if (!equb.payouts) equb.payouts = [];
    const payout = equb.payouts.find((p) => p.id === payoutId);
    if (!payout) return;

    payout.payoutStatus = status;
    payout.transactionRef = transactionRef || payout.transactionRef;
    payout.notes = notes || payout.notes;
    if (status === "paid" && !payout.payoutDate) {
      payout.payoutDate = new Date().toISOString();
    }
  });

  return { success: true };
}

export async function updateEqubSettings(equbId, _prev, formData) {
  const name = text(formData, "name");
  const maxMembers = Number(text(formData, "maxMembers"));

  await updateEqub(equbId, (equb) => {
    if (name && name.length >= 3) equb.name = name;
    if (maxMembers && maxMembers >= equb.members.length) equb.maxMembers = maxMembers;
  });

  return { success: true, message: "Settings updated successfully" };
}

export async function deleteEqub(equbId) {
  const user = await requireUser();
  await mutate((db) => {
    db.equbs = db.equbs.filter((equb) => !(equb.id === equbId && equb.ownerId === user.id));
  });
  redirect("/equbs");
}