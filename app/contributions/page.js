import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listEqubs } from "@/lib/queries";
import { currentRound, dueDate, getPaymentRecord, roundContributionAmount, statusOf } from "@/lib/equb";
import { formatETB, formatDate, formatDateTime } from "@/lib/format";
import {
  Receipt,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export const metadata = {
  title: "Contributions & Collections",
  description: "Track receivables, collection rates, and member contributions in Ethiopian Birr.",
};

export default async function ContributionsPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  let totalExpected = 0;
  let totalCollected = 0;
  let paidCount = 0;
  let pendingCount = 0;

  const recordsList = [];

  for (const equb of equbs) {
    const round = currentRound(equb);
    const unitAmount = roundContributionAmount(equb);
    const roundDue = round ? dueDate(equb, round.number) : null;

    if (round) {
      for (const member of equb.members) {
        const payment = getPaymentRecord(equb, round, member.id);
        totalExpected += unitAmount;
        totalCollected += payment.amountPaid;

        if (payment.status === "paid") paidCount++;
        else pendingCount++;

        recordsList.push({
          equbId: equb.id,
          equbName: equb.name,
          memberId: member.id,
          memberName: member.name,
          roundNumber: round.number,
          cycleNumber: equb.currentCycle || 1,
          amountDue: unitAmount,
          amountPaid: payment.amountPaid,
          status: payment.status,
          paymentDate: payment.paymentDate,
          transactionRef: payment.transactionRef,
          recordedBy: payment.recordedBy || user.name,
          dueDate: roundDue,
        });
      }
    }
  }

  const outstanding = Math.max(0, totalExpected - totalCollected);

  return (
    <div className="contributions-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Contribution Ledger</h1>
          <p className="page-subtitle">
            Audit contributions, track outstanding collections, and verify payments in Ethiopian Birr.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Expected Round Pool</span>
            <Wallet size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{formatETB(totalExpected)}</div>
          <div className="stat-card-hint">Total scheduled for current rounds</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Actual Collected</span>
            <Receipt size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value success-text">{formatETB(totalCollected)}</div>
          <div className="stat-card-hint">{paidCount} contributions confirmed</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Receivables</span>
            <Clock size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value gold-text">{formatETB(outstanding)}</div>
          <div className="stat-card-hint">{pendingCount} payments outstanding</div>
        </div>
      </div>

      {/* Payment Gateway Transparency Notice */}
      <div className="card note-box">
        <div className="note-icon-wrap">
          <CreditCard size={18} />
        </div>
        <div>
          <strong>Payment Verification & Gateway Integration Notice</strong>
          <p className="hint">
            Direct Telebirr and CBE Birr automated gateway processing is prepared as a modular extension.
            Current transactions are logged and verified by authorized organizers using verifiable bank transaction references.
          </p>
        </div>
      </div>

      {/* Contributions Table */}
      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Current Round Contributions ({recordsList.length})</h2>
            <p className="card-subtitle">
              Detailed breakdown of member payments across all active Equb rounds.
            </p>
          </div>
        </div>

        {recordsList.length === 0 ? (
          <div className="empty-state-box">
            <p>No active rounds requiring contribution tracking at this time.</p>
            <Link href="/equbs" className="button">
              View Equb Circles
            </Link>
          </div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Equb Group</th>
                  <th>Round & Cycle</th>
                  <th>Due / Paid</th>
                  <th>Status</th>
                  <th>Transaction Reference</th>
                  <th>Recorded By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recordsList.map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{rec.memberName}</strong>
                    </td>
                    <td>
                      <Link href={`/equbs/${rec.equbId}`} className="table-group-link">
                        {rec.equbName}
                      </Link>
                    </td>
                    <td>
                      Cycle {rec.cycleNumber} &middot; Rd {rec.roundNumber}
                    </td>
                    <td>
                      <span>{formatETB(rec.amountPaid)}</span> /{" "}
                      <span className="text-muted">{formatETB(rec.amountDue)}</span>
                    </td>
                    <td>
                      <span
                        className={
                          rec.status === "paid"
                            ? "badge badge-payout"
                            : rec.status === "partially_paid"
                            ? "badge badge-waiting"
                            : rec.status === "overdue"
                            ? "badge badge-danger"
                            : "badge badge-muted"
                        }
                      >
                        {rec.status === "paid"
                          ? "Paid"
                          : rec.status === "partially_paid"
                          ? "Partially Paid"
                          : rec.status === "overdue"
                          ? "Overdue"
                          : "Pending"}
                      </span>
                    </td>
                    <td>
                      {rec.transactionRef ? (
                        <code>{rec.transactionRef}</code>
                      ) : (
                        <span className="text-muted">&mdash;</span>
                      )}
                    </td>
                    <td>{rec.recordedBy || "Organizer"}</td>
                    <td>
                      <Link href={`/equbs/${rec.equbId}`} className="button button-sm button-secondary">
                        <span>Record / View</span>
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
