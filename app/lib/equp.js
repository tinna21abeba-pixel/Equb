import { randomInt } from "crypto";

export const frequencyLabels = {
  weekly: "every week",
  biweekly: "every two weeks",
  monthly: "every month",
};

export const currentRound = (equb) => equb.rounds.find((round) => !round.winnerId) ?? null;

export const potOf = (equb) => equb.amount * equb.members.length;

export const isLocked = (equb) =>
  equb.rounds.some((round) => round.winnerId || Object.keys(round.payments).length > 0);

export function eligibleMembers(equb) {
  const won = new Set(equb.rounds.map((round) => round.winnerId).filter(Boolean));
  return equb.members.filter((member) => !won.has(member.id));
}

export function pickWinner(equb) {
  const pool = eligibleMembers(equb);
  return equb.drawMethod === "order" ? pool[0] : pool[randomInt(pool.length)];
}

export function statusOf(equb) {
  const round = currentRound(equb);
  const paid = round ? equb.members.filter((member) => round.payments[member.id]).length : 0;
  return {
    round: round?.number ?? null,
    totalRounds: equb.members.length,
    members: equb.members.length,
    paid,
    collected: paid * equb.amount,
    pot: potOf(equb),
    complete: round === null,
  };
}

export function dueDate(equb, number) {
  const date = new Date(`${equb.startDate}T00:00:00`);
  const step = number - 1;
  if (equb.frequency === "monthly") {
    date.setMonth(date.getMonth() + step);
  } else {
    date.setDate(date.getDate() + step * (equb.frequency === "weekly" ? 7 : 14));
  }
  return date;
}