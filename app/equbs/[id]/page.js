import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import RoundProgress from "@/components/RoundProgress";
import DrawControls from "@/components/DrawControls";
import PaymentRecordModal from "@/components/PaymentRecordModal";
import PayoutVerificationModal from "@/components/PayoutVerificationModal";
import { addMember, deleteEqub, removeMember, togglePayment } from "@/app/actions";
import { memberFields } from "@/lib/fields";
import { requireUser } from "@/lib/session";
import { findEqub } from "@/lib/queries";
import {currentRound,dueDate,eligibleMembers,frequencyLabels, isLocked,statusOf,getPaymentRecord,roundContributionAmount} from "@/lib/equb";
import { formatDate, formatDateTime, formatETB } from "@/lib/format";
import {ArrowLeft,Users, Calendar, Wallet, Trophy,ShieldCheck,CheckCircle2,Clock,AlertCircle,PauseCircleTrash2,Receipt,} from "lucide-react";

export default async function EqubDetailPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const equb = await findEqub(user.id, id);
  if (!equb) notFound();

  const status = statusOf(equb);
  const round = currentRound(equb);
  const locked = isLocked(equb);
  const eligible = eligibleMembers(equb);
  const currentCycleNum = equb.currentCycle ?? 1;
  const unitAmount = roundContributionAmount(equb);

  // Collect all payouts (both new schema and fallback from rounds)
  const payoutsList = [...(equb.payouts || [])];
  if (payoutsList.length === 0) {
    const historicalRounds = equb.rounds.filter((r) => r.winnerId);
    for (const r of historicalRounds) {
      const winner = equb.members.find((m) => m.id === r.winnerId);
      payoutsList.push({
        id: `legacy_${r.number}`,
        roundNumber: r.number,
        cycleNumber: r.cycle || 1,
        winnerId: r.winnerId,
        winnerName: winner?.name || "Member",
        potAmount: status.pot,
        drawnAt: r.drawnAt,
        payoutStatus: "verified",
        notes: "Historical draw record",
      });
    }
  }

  // Map of which round a member won in current cycle
  const wonInCurrentCycle = new Map();
  for (const r of equb.rounds.filter(
    (item) => item.winnerId && (item.cycle ?? 1) === currentCycleNum
  )) {
    wonInCurrentCycle.set(r.winnerId, r.number);
  }

  const dueDateVal = round ? dueDate(equb, round.number) : null;
  const atCapacity = equb.members.length >= (equb.maxMembers || 50);

  return (
    <div className="equb-detail-wrap">
     
      <Link href="/equbs" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to All Equb Groups</span>
      </Link>

      {/* Header Block */}
      <div className="equb-page-header">
        <div className="header-left-col">
          <div className="title-row">
            <h1 className="page-title">{equb.name}</h1>
            {status.drawPaused && (
              <span className="badge badge-waiting">
                <PauseCircle size={13} />
                <span>Draw Paused</span>
              </span>
            )}
            {status.complete && (
              <span className="badge badge-primary">
                <CheckCircle2 size={13} />
                <span>Cycle {currentCycleNum} Completed</span>
              </span>
            )}
          </div>
          <p className="page-subtitle">
            {formatETB(equb.amount)} {frequencyLabels[equb.frequency]} &middot; Cycle {currentCycleNum} &middot;{" "}
            {equb.members.length} of {equb.maxMembers || 50} members enrolled
          </p>
        </div>
      </div>


      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Contribution Unit</span>
            <Wallet size={16} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{formatETB(equb.amount)}</div>
          <div className="stat-card-hint">{frequencyLabels[equb.frequency]} per member</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Target Round Pot</span>
            <Trophy size={16} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{formatETB(status.pot)}</div>
          <div className="stat-card-hint">
            {equb.members.length} members &times; {formatETB(unitAmount)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Round Collected</span>
            <Receipt size={16} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{formatETB(status.collected)}</div>
          <div className="stat-card-hint">
            {status.paid} of {status.members} members fully paid
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Eligible Candidates</span>
            <Users size={16} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{eligible.length}</div>
          <div className="stat-card-hint">Unpaid candidates in Cycle {currentCycleNum}</div>
        </div>
      </div>

      {/* Current Round & Draw Governance Card */}
      <section className="card card-emerald-accent">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">
              {round
                ? `Round ${round.number} of ${equb.members.length || 1} (Cycle ${currentCycleNum})`
                : `Cycle ${currentCycleNum} Complete`}
            </h2>
            <p className="card-subtitle">
              {round
                ? `Contribution deadline and scheduled draw: ${formatDate(dueDateVal)}`
                : "Every enrolled member has received the pot in this cycle."}
            </p>
          </div>
        </div>

        {round && <RoundProgress equbId={equb.id} initial={status} />}

        <DrawControls
          equb={equb}
          status={status}
          round={round}
          eligibleCount={eligible.length}
          dueDateVal={dueDateVal}
        />
      </section>

      {/* Member Management Roster */}
      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Member Roster & Contributions</h2>
            <p className="card-subtitle">
              {equb.members.length} registered {equb.members.length === 1 ? "member" : "members"} &middot;{" "}
              {equb.maxMembers || 50} maximum capacity
            </p>
          </div>
        </div>

        {equb.members.length === 0 ? (
          <div className="empty-roster-box">
            <p>No members registered yet. Add at least two members below to begin.</p>
          </div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Phone</th>
                  <th>Contribution Status</th>
                  <th>Cycle Winner Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {equb.members.map((member) => {
                  const paymentRecord = getPaymentRecord(equb, round, member.id);
                  const isPaid = paymentRecord.status === "paid";
                  const wonRound = wonInCurrentCycle.get(member.id);

                  return (
                    <tr key={member.id}>
                      <td>
                        <strong>{member.name}</strong>
                      </td>
                      <td>{member.phone}</td>
                      <td>
                        {round ? (
                          <div className="payment-cell-cluster">
                            <form action={togglePayment.bind(null, equb.id, member.id)}>
                              <button
                                type="submit"
                                className={isPaid ? "small paid" : "small button-secondary"}
                                title="Quick toggle full payment"
                              >
                                {isPaid ? "Paid" : "Quick Mark"}
                              </button>
                            </form>
                            <PaymentRecordModal
                              equbId={equb.id}
                              member={member}
                              roundNumber={round.number}
                              amountDue={unitAmount}
                              currentRecord={paymentRecord}
                            />
                          </div>
                        ) : (
                          <span className="badge badge-primary">Cycle Finished</span>
                        )}
                      </td>
                      <td>
                        {wonRound ? (
                          <span className="badge badge-payout">
                            Won in Round {wonRound}
                          </span>
                        ) : (
                          <span className="badge badge-waiting">
                            Eligible Candidate
                          </span>
                        )}
                      </td>
                      <td>
                        {!locked && (
                          <form action={removeMember.bind(null, equb.id, member.id)}>
                            <button type="submit" className="link">
                              Remove
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Member Form (If not locked and not at capacity) */}
      {locked ? (
        <div className="card note-box">
          <div className="note-icon-wrap">
            <AlertCircle size={18} />
          </div>
          <div>
            <strong>Member Roster Locked</strong>
            <p className="hint">
              Member roster is locked after the first payment is recorded to preserve draw integrity.
            </p>
          </div>
        </div>
      ) : atCapacity ? (
        <div className="card note-box">
          <div className="note-icon-wrap">
            <AlertCircle size={18} />
          </div>
          <div>
            <strong>Plan Capacity Reached</strong>
            <p className="hint">
              This Equb group has reached its maximum plan capacity of {equb.maxMembers || 50} members.
            </p>
          </div>
        </div>
      ) : (
        <section className="card">
          <h2 className="card-title">Enroll Member</h2>
          <p className="card-subtitle">
            Add a participant with an Ethiopian mobile phone number (09... or +251...).
          </p>
          <ActionForm action={addMember.bind(null, equb.id)} fields={memberFields} submit="Enroll Member" />
        </section>
      )}

      {/* Payout & Historical Records */}
      {payoutsList.length > 0 && (
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Payout & Draw Ledger</h2>
              <p className="card-subtitle">
                Complete historical record of lottery winners and disbursement statuses.
              </p>
            </div>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Cycle</th>
                  <th>Winner</th>
                  <th>Pot Amount</th>
                  <th>Draw Date</th>
                  <th>Disbursement Status</th>
                  <th>Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {payoutsList.map((payout) => (
                  <tr key={payout.id}>
                    <td>
                      <strong>Round {payout.roundNumber}</strong>
                    </td>
                    <td>Cycle {payout.cycleNumber || 1}</td>
                    <td>{payout.winnerName}</td>
                    <td className="gold-text font-bold">{formatETB(payout.potAmount)}</td>
                    <td>{formatDateTime(payout.drawnAt)}</td>
                    <td>
                      <span
                        className={
                          payout.payoutStatus === "paid"
                            ? "badge badge-payout"
                            : payout.payoutStatus === "verified"
                            ? "badge badge-primary"
                            : "badge badge-waiting"
                        }
                      >
                        {payout.payoutStatus === "paid"
                          ? "Disbursed"
                          : payout.payoutStatus === "verified"
                          ? "Verified"
                          : "Pending Verification"}
                      </span>
                    </td>
                    <td>
                      <PayoutVerificationModal equbId={equb.id} payout={payout} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Administrative Danger Zone */}
      <details className="card danger-card">
        <summary className="danger-summary">
          <Trash2 size={16} />
          <span>Permanently Delete Equb Group</span>
        </summary>
        <div className="danger-content">
          <p>
            Warning: This action will permanently delete this Equb group, all enrolled members,
            payment records, and historical lottery cycle records. This cannot be undone.
          </p>
          <form action={deleteEqub.bind(null, equb.id)}>
            <button type="submit" className="button danger">
              Confirm & Delete Permanently
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}