import { randomInt } from "crypto";
import { getPlanById } from "@/lib/plans";

export const frequencyLabels = {
  daily: "every day",
  weekly: "every week",
  biweekly: "every two weeks",
  monthly: "every month",
};

/**
 * Returns the effective round contribution per member
 */
export function roundContributionAmount(equb) {
  if (equb.planId) {
    const plan = getPlanById(equb.planId);
    if (plan?.effectiveRoundAmount) {
      return plan.effectiveRoundAmount;
    }
  }
  return Number(equb.amount || 0);
}

/**
 * Finds the current uncompleted round in the current cycle
 */
export const currentRound = (equb) =>
  equb.rounds.find((round) => !round.winnerId && (round.cycle ?? 1) === (equb.currentCycle ?? 1)) ??
  equb.rounds.find((round) => !round.winnerId) ??
  null;

/**
 * Calculates the target pot for an equb round
 */
export const potOf = (equb) => roundContributionAmount(equb) * equb.members.length;

/**
 * Checks if the member roster is locked
 */
export const isLocked = (equb) =>
  equb.rounds.some(
    (round) => round.winnerId || (round.payments && Object.keys(round.payments).length > 0)
  );

/**
 * Normalizes a member's payment record for a given round
 */
export function getPaymentRecord(equb, round, memberId) {
  if (!round || !round.payments || !round.payments[memberId]) {
    const isPastDue = round && dueDate(equb, round.number) < new Date();
    return {
      status: isPastDue ? "overdue" : "pending",
      amountPaid: 0,
      amountDue: roundContributionAmount(equb),
      paymentDate: null,
      transactionRef: "",
      recordedBy: null,
    };
  }

  const raw = round.payments[memberId];
  if (typeof raw === "string") {
    return {
      status: "paid",
      amountPaid: roundContributionAmount(equb),
      amountDue: roundContributionAmount(equb),
      paymentDate: raw,
      transactionRef: "",
      recordedBy: null,
    };
  }

  return {
    status: raw.status || (raw.amountPaid >= roundContributionAmount(equb) ? "paid" : "partially_paid"),
    amountPaid: Number(raw.amountPaid ?? roundContributionAmount(equb)),
    amountDue: Number(raw.amountDue ?? roundContributionAmount(equb)),
    paymentDate: raw.paymentDate || null,
    transactionRef: raw.transactionRef || "",
    recordedBy: raw.recordedBy || null,
  };
}

/**
 * Returns all winners within the specified or current cycle
 */
export function cycleWinners(equb, cycleNumber = equb.currentCycle ?? 1) {
  return equb.rounds
    .filter((round) => (round.cycle ?? 1) === cycleNumber && round.winnerId)
    .map((round) => round.winnerId);
}

/**
 * Returns eligible members who have not yet won in the current cycle
 */
export function eligibleMembers(equb) {
  const currentCycleNum = equb.currentCycle ?? 1;
  const wonInCycle = new Set(cycleWinners(equb, currentCycleNum));
  return equb.members.filter((member) => !wonInCycle.has(member.id));
}

/**
 * Fair lottery selection on the server
 */
export function pickWinner(equb) {
  const pool = eligibleMembers(equb);
  if (pool.length === 0) return null;
  return equb.drawMethod === "order" ? pool[0] : pool[randomInt(pool.length)];
}

/**
 * Full financial and progress status
 */
export function statusOf(equb) {
  const round = currentRound(equb);
  const currentCycleNum = equb.currentCycle ?? 1;
  const unitAmount = roundContributionAmount(equb);

  let paidMembersCount = 0;
  let partialMembersCount = 0;
  let actualCollected = 0;

  if (round && round.payments) {
    for (const member of equb.members) {
      const rec = getPaymentRecord(equb, round, member.id);
      if (rec.status === "paid") {
        paidMembersCount++;
        actualCollected += rec.amountPaid;
      } else if (rec.status === "partially_paid") {
        partialMembersCount++;
        actualCollected += rec.amountPaid;
      }
    }
  }

  const expectedPool = equb.members.length * unitAmount;
  const isDrawPaused = Boolean(equb.drawPaused);
  const eligible = eligibleMembers(equb);
  const cycleComplete = equb.members.length > 0 && eligible.length === 0 && !round;

  return {
    round: round?.number ?? null,
    cycle: currentCycleNum,
    totalRounds: equb.members.length,
    members: equb.members.length,
    maxMembers: equb.maxMembers || 50,
    paid: paidMembersCount,
    partial: partialMembersCount,
    collected: actualCollected,
    expected: expectedPool,
    pot: potOf(equb),
    complete: cycleComplete || (!round && equb.members.length > 0),
    drawPaused: isDrawPaused,
    canDraw: Boolean(round) && equb.members.length >= 2 && !isDrawPaused && eligible.length > 0,
    allPaid: Boolean(round) && equb.members.length > 0 && paidMembersCount === equb.members.length,
  };
}

/**
 * Calculates scheduled due date for a given round
 */
export function dueDate(equb, number) {
  const date = new Date(`${equb.startDate}T00:00:00`);
  const step = Math.max(0, number - 1);
  if (equb.frequency === "daily") {
    date.setDate(date.getDate() + step);
  } else if (equb.frequency === "monthly") {
    date.setMonth(date.getMonth() + step);
  } else {
    date.setDate(date.getDate() + step * (equb.frequency === "weekly" ? 7 : 14));
  }
  return date;
}