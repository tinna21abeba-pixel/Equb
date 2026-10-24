import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listEqubs } from "@/lib/queries";
import { formatETB, formatDate, formatDateTime } from "@/lib/format";
import { statusOf } from "@/lib/equb";
import {
  Trophy,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Payout History & Disbursements",
  description: "Audit completed pot disbursements, verification notes, and bank transfer receipts.",
};

export default async function PayoutsPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  let totalDisbursed = 0;
  let totalPending = 0;
  const allPayouts = [];

  for (const equb of equbs) {
    const status = statusOf(equb);
    const payouts = equb.payouts || [];

    if (payouts.length > 0) {
      for (const p of payouts) {
        if (p.payoutStatus === "paid") {
          totalDisbursed += p.potAmount;
        } else {
          totalPending += p.potAmount;
        }
        allPayouts.push({
          ...p,
          equbId: equb.id,
          equbName: equb.name,
        });
      }
    } else {
      // Fallback for existing historical rounds
      for (const r of equb.rounds.filter((r) => r.winnerId)) {
        const winner = equb.members.find((m) => m.id === r.winnerId);
        totalDisbursed += status.pot;
        allPayouts.push({
          id: `hist_${r.number}`,
          roundNumber: r.number,
          cycleNumber: r.cycle || 1,
          winnerName: winner?.name || "Member",
          potAmount: status.pot,
          drawnAt: r.drawnAt,
          payoutStatus: "paid",
          payoutDate: r.drawnAt,
          transactionRef: "",
          equbId: equb.id,
          equbName: equb.name,
        });
      }
    }
  }

  allPayouts.sort((a, b) => new Date(b.drawnAt || 0) - new Date(a.drawnAt || 0));

  return (
    <div className="payouts-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Payout & Disbursement History</h1>
          <p className="page-subtitle">
            Transparent record of all pot disbursements, bank references, and organizer verifications.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Disbursed Funds</span>
            <CheckCircle2 size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value success-text">{formatETB(totalDisbursed)}</div>
          <div className="stat-card-hint">Successfully transferred to winners</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Disbursements</span>
            <Clock size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value gold-text">{formatETB(totalPending)}</div>
          <div className="stat-card-hint">Drawn rounds awaiting release</div>
        </div>
      </div>

      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Disbursement Records ({allPayouts.length})</h2>
            <p className="card-subtitle">
              Verify receipt numbers, disbursement timestamps, and payment approvals.
            </p>
          </div>
        </div>

        {allPayouts.length === 0 ? (
          <div className="empty-state-box">
            <p>No lottery winners or payouts recorded yet.</p>
            <Link href="/equbs" className="button">
              View Equbs
            </Link>
          </div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Round & Cycle</th>
                  <th>Equb Group</th>
                  <th>Beneficiary Winner</th>
                  <th>Pot Amount</th>
                  <th>Draw Date</th>
                  <th>Disbursement Status</th>
                  <th>Bank / Txn Ref</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allPayouts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>
                        Cycle {p.cycleNumber} &middot; Round {p.roundNumber}
                      </strong>
                    </td>
                    <td>
                      <Link href={`/equbs/${p.equbId}`} className="table-group-link">
                        {p.equbName}
                      </Link>
                    </td>
                    <td>{p.winnerName}</td>
                    <td className="gold-text font-bold">{formatETB(p.potAmount)}</td>
                    <td>{formatDate(p.drawnAt)}</td>
                    <td>
                      <span
                        className={
                          p.payoutStatus === "paid"
                            ? "badge badge-payout"
                            : p.payoutStatus === "verified"
                            ? "badge badge-primary"
                            : "badge badge-waiting"
                        }
                      >
                        {p.payoutStatus === "paid"
                          ? "Disbursed"
                          : p.payoutStatus === "verified"
                          ? "Verified"
                          : "Pending Release"}
                      </span>
                    </td>
                    <td>
                      {p.transactionRef ? (
                        <code>{p.transactionRef}</code>
                      ) : (
                        <span className="text-muted">&mdash;</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/equbs/${p.equbId}`} className="button button-sm button-secondary">
                        <span>Manage</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
