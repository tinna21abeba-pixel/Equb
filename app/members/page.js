import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listEqubs } from "@/lib/queries";
import { currentRound, getPaymentRecord, cycleWinners } from "@/lib/equb";
import { formatETB } from "@/lib/format";
import { Users, Layers, Phone, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Member Management",
  description: "Search and manage participants enrolled across all Equb savings groups.",
};

export default async function MembersPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  // Aggregate all members with context
  const membersList = [];
  for (const equb of equbs) {
    const round = currentRound(equb);
    const wonSet = new Set(cycleWinners(equb, equb.currentCycle || 1));

    for (const member of equb.members) {
      const payment = getPaymentRecord(equb, round, member.id);
      membersList.push({
        id: member.id,
        name: member.name,
        phone: member.phone,
        equbId: equb.id,
        equbName: equb.name,
        equbAmount: equb.amount,
        cycle: equb.currentCycle || 1,
        isPaid: payment.status === "paid",
        paymentStatus: payment.status,
        hasWon: wonSet.has(member.id),
      });
    }
  }

  return (
    <div className="members-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Member Roster</h1>
          <p className="page-subtitle">
            Centralized directory of all participants enrolled across your {equbs.length} Equb circles.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Members</span>
            <Users size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{membersList.length}</div>
          <div className="stat-card-hint">Enrolled across all groups</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Participating Circles</span>
            <Layers size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{equbs.length}</div>
          <div className="stat-card-hint">Active Equb groups</div>
        </div>
      </div>

      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Enrolled Participants ({membersList.length})</h2>
            <p className="card-subtitle">
              Verify contact information, current round payment statuses, and lottery eligibility.
            </p>
          </div>
        </div>

        {membersList.length === 0 ? (
          <div className="empty-state-box">
            <p>No members registered yet in any Equb circle.</p>
            <Link href="/equbs" className="button">
              Go to Equbs & Enroll Members
            </Link>
          </div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Participant Name</th>
                  <th>Ethiopian Phone</th>
                  <th>Equb Group</th>
                  <th>Round Due</th>
                  <th>Current Round Payment</th>
                  <th>Cycle Draw Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {membersList.map((m) => (
                  <tr key={`${m.equbId}-${m.id}`}>
                    <td>
                      <strong>{m.name}</strong>
                    </td>
                    <td>{m.phone}</td>
                    <td>
                      <Link href={`/equbs/${m.equbId}`} className="table-group-link">
                        {m.equbName}
                      </Link>
                    </td>
                    <td>{formatETB(m.equbAmount)}</td>
                    <td>
                      {m.isPaid ? (
                        <span className="badge badge-payout">Paid</span>
                      ) : m.paymentStatus === "partially_paid" ? (
                        <span className="badge badge-waiting">Partially Paid</span>
                      ) : (
                        <span className="badge badge-muted">Pending</span>
                      )}
                    </td>
                    <td>
                      {m.hasWon ? (
                        <span className="badge badge-payout">Received Pot</span>
                      ) : (
                        <span className="badge badge-primary">Eligible Candidate</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/equbs/${m.equbId}`} className="button button-sm button-secondary">
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
