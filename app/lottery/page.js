import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listEqubs } from "@/lib/queries";
import {
  currentRound,
  dueDate,
  eligibleMembers,
  cycleWinners,
  statusOf,
} from "@/lib/equb";
import { formatETB, formatDate, formatDateTime } from "@/lib/format";
import {
  Trophy,
  Calendar,
  Users,
  Wallet,
  CheckCircle2,
  PauseCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Lottery & Winner Draws",
  description: "Monitor cycle rounds, eligible candidates, and execute fair lottery draws on the server.",
};

export default async function LotteryPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  const lotteryCards = [];
  const allHistoricalDraws = [];

  for (const equb of equbs) {
    const status = statusOf(equb);
    const round = currentRound(equb);
    const currentCycleNum = equb.currentCycle ?? 1;
    const eligible = eligibleMembers(equb);
    const pastWinners = cycleWinners(equb, currentCycleNum);

    lotteryCards.push({
      id: equb.id,
      name: equb.name,
      plan: equb.frequency,
      round: round?.number ?? null,
      cycle: currentCycleNum,
      dueDate: round ? dueDate(equb, round.number) : null,
      eligibleCount: eligible.length,
      pastWinnersCount: pastWinners.length,
      totalMembers: equb.members.length,
      collected: status.collected,
      pot: status.pot,
      drawPaused: Boolean(equb.drawPaused),
      complete: status.complete,
      allPaid: status.allPaid,
    });

    for (const r of equb.rounds.filter((r) => r.winnerId)) {
      const winner = equb.members.find((m) => m.id === r.winnerId);
      allHistoricalDraws.push({
        equbId: equb.id,
        equbName: equb.name,
        roundNumber: r.number,
        cycleNumber: r.cycle || 1,
        winnerName: winner?.name || "Member",
        pot: status.pot,
        drawnAt: r.drawnAt,
      });
    }
  }

  allHistoricalDraws.sort((a, b) => new Date(b.drawnAt || 0) - new Date(a.drawnAt || 0));

  return (
    <div className="lottery-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Lottery & Winner Draws</h1>
          <p className="page-subtitle">
            Server-side random selection ensuring exactly one winner per round and zero duplicate winners per cycle.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Cycles</span>
            <Trophy size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{lotteryCards.filter((c) => !c.complete).length}</div>
          <div className="stat-card-hint">In progress savings cycles</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed Draws</span>
            <CheckCircle2 size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{allHistoricalDraws.length}</div>
          <div className="stat-card-hint">Total rounds executed to date</div>
        </div>
      </div>

      {/* Lottery Groups Status Grid */}
      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Active Lottery Rounds by Equb</h2>
            <p className="card-subtitle">
              Verify participant eligibility, collected funds, and execute pending draws.
            </p>
          </div>
        </div>

        {lotteryCards.length === 0 ? (
          <div className="empty-state-box">
            <p>No Equbs created yet to monitor lottery rounds.</p>
            <Link href="/equbs/new" className="button">
              Create an Equb
            </Link>
          </div>
        ) : (
          <div className="lottery-groups-grid">
            {lotteryCards.map((item) => (
              <div key={item.id} className="lottery-card-box">
                <div className="lottery-card-header">
                  <div>
                    <h3 className="lottery-card-title">{item.name}</h3>
                    <span className="text-muted text-sm">
                      Cycle {item.cycle} &middot; {item.plan}
                    </span>
                  </div>
                  <div>
                    {item.drawPaused ? (
                      <span className="badge badge-waiting">
                        <PauseCircle size={12} />
                        <span>Draw Paused</span>
                      </span>
                    ) : item.complete ? (
                      <span className="badge badge-primary">Cycle Finished</span>
                    ) : (
                      <span className="badge badge-primary">Round {item.round}</span>
                    )}
                  </div>
                </div>

                <div className="lottery-card-body">
                  <div className="lottery-stat-line">
                    <span className="text-muted">Eligible Candidates:</span>
                    <strong className="text-primary">
                      {item.eligibleCount} of {item.totalMembers} members
                    </strong>
                  </div>
                  <div className="lottery-stat-line">
                    <span className="text-muted">Cycle Past Winners:</span>
                    <span>{item.pastWinnersCount} members</span>
                  </div>
                  <div className="lottery-stat-line">
                    <span className="text-muted">Target Round Pot:</span>
                    <strong className="gold-text">{formatETB(item.pot)}</strong>
                  </div>
                  <div className="lottery-stat-line">
                    <span className="text-muted">Collected Round Funds:</span>
                    <strong className="success-text">{formatETB(item.collected)}</strong>
                  </div>
                  {item.dueDate && (
                    <div className="lottery-stat-line">
                      <span className="text-muted">Scheduled Draw:</span>
                      <span>{formatDate(item.dueDate)}</span>
                    </div>
                  )}
                </div>

                <div className="lottery-card-footer">
                  <Link href={`/equbs/${item.id}`} className="button button-sm button-gold">
                    <Trophy size={14} />
                    <span>Manage & Execute Draw</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historical Winners Record */}
      {allHistoricalDraws.length > 0 && (
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Completed Lottery Draw Ledger</h2>
              <p className="card-subtitle">Permanent historical record of winners across cycles.</p>
            </div>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Round & Cycle</th>
                  <th>Equb Group</th>
                  <th>Selected Winner</th>
                  <th>Pot Awarded</th>
                  <th>Draw Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {allHistoricalDraws.map((draw, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>
                        Cycle {draw.cycleNumber} &middot; Round {draw.roundNumber}
                      </strong>
                    </td>
                    <td>
                      <Link href={`/equbs/${draw.equbId}`} className="table-group-link">
                        {draw.equbName}
                      </Link>
                    </td>
                    <td>{draw.winnerName}</td>
                    <td className="gold-text font-bold">{formatETB(draw.pot)}</td>
                    <td>{formatDateTime(draw.drawnAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
