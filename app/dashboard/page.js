import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listEqubs } from "@/lib/queries";
import { currentRound, dueDate, statusOf, roundContributionAmount } from "@/lib/equb";
import { formatETB, formatDate, formatDateTime } from "@/lib/format";
import {LayoutDashboard,Layers,Users,Wallet,Trophy,ArrowRight,Receipt, Calendar, Clock,CheckCircle2,AlertCircle,TrendingUp, Receip,} from "lucide-react";

export const metadata = {
  title: "Financial Dashboard",
  description: "Executive Ethiopian Equb Financial Overview and Portfolio Analytics",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  let totalActiveGroups = 0;
  let totalMembers = 0;
  let totalExpected = 0;
  let totalCollected = 0;
  let totalCompletedPayouts = 0;
  let totalPendingPayouts = 0;

  const upcomingDraws = [];
  const groupProgressList = [];
  const recentActivities = [];

  for (const equb of equbs) {
    const status = statusOf(equb);
    const round = currentRound(equb);
    const unitAmount = roundContributionAmount(equb);

    if (!status.complete) totalActiveGroups++;
    totalMembers += equb.members.length;
    totalExpected += status.expected || 0;
    totalCollected += status.collected || 0;

    // Payout stats
    const payouts = equb.payouts || [];
    for (const p of payouts) {
      if (p.payoutStatus === "paid") {
        totalCompletedPayouts += p.potAmount || 0;
      } else {
        totalPendingPayouts += p.potAmount || 0;
      }
    }

    if (round) {
      const nextDue = dueDate(equb, round.number);
      upcomingDraws.push({
        equbId: equb.id,
        equbName: equb.name,
        roundNumber: round.number,
        cycleNumber: equb.currentCycle || 1,
        dueDate: nextDue,
        pot: status.pot,
        collected: status.collected,
        paidCount: status.paid,
        memberCount: equb.members.length,
        isPaused: Boolean(equb.drawPaused),
      });
    }

    groupProgressList.push({
      id: equb.id,
      name: equb.name,
      plan: equb.frequency,
      membersCount: equb.members.length,
      maxMembers: equb.maxMembers || 50,
      roundNumber: round?.number ?? equb.members.length,
      totalRounds: equb.members.length || 1,
      collected: status.collected,
      targetPot: status.pot,
      complete: status.complete,
      cycle: equb.currentCycle || 1,
      isPaused: Boolean(equb.drawPaused),
    });

    for (const r of equb.rounds.filter((r) => r.drawnAt)) {
      const winner = equb.members.find((m) => m.id === r.winnerId);
      recentActivities.push({
        type: "draw",
        title: `Round ${r.number} Winner Drawn`,
        desc: `${winner?.name || "Member"} selected for ${formatETB(status.pot)} in ${equb.name}`,
        date: new Date(r.drawnAt),
      });
    }
  }
  upcomingDraws.sort((a, b) => a.dueDate - b.dueDate);
  recentActivities.sort((a, b) => b.date - a.date);

  const pendingAmount = Math.max(0, totalExpected - totalCollected);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div className="dashboard-content-wrap">
     
      <div className="dashboard-welcome-banner">
        <div>
         
          <h1 className="welcome-title">Ethiopian Equb Financial Dashboard</h1>
          <p className="welcome-subtitle">
            Consolidated metrics, liquidity status, and lottery schedule across all your savings circles.
          </p>
        </div>
    
      </div>

      {/* Top Key Performance Indicators */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Equb Groups</span>
            
          </div>
          <div className="stat-card-value">{totalActiveGroups}</div>
          <div className="stat-card-hint">
            {equbs.length} registered {equbs.length === 1 ? "circle" : "circles"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Enrolled Members</span>
           
          </div>
          <div className="stat-card-value">{totalMembers}</div>
          <div className="stat-card-hint">Active participants across groups</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Expected Contributions</span>
            
          </div>
          <div className="stat-card-value">{formatETB(totalExpected)}</div>
          <div className="stat-card-hint">Total round receivables</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Actual Collected</span>
          
          </div>
          <div className="stat-card-value">{formatETB(totalCollected)}</div>
          <div className="stat-card-hint">{collectionRate}% collected to date</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Receivables</span>
            
          </div>
          <div className="stat-card-value">{formatETB(pendingAmount)}</div>
          <div className="stat-card-hint">Awaiting member contribution</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed Payouts</span>
           
          </div>
          <div className="stat-card-value">{formatETB(totalCompletedPayouts)}</div>
          <div className="stat-card-hint">{formatETB(totalPendingPayouts)} pending release</div>
        </div>
      </div>

     
      <div className="dashboard-two-col">
        {/* Real Data Contribution Chart */}
        <section className="card card-emerald-accent">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Contribution & Liquidity Analysis</h2>
              <p className="card-subtitle">
                Real-time ratio of collected contributions vs expected targets by Equb group.
              </p>
            </div>
            <span className="badge badge-primary">
              <TrendingUp size={12} />
              <span>{collectionRate}% Overall Health</span>
            </span>
          </div>

          {equbs.length === 0 ? (
            <p className="empty-chart-note">No Equbs active yet to generate analytics.</p>
          ) : (
            <div className="chart-bar-list">
              {groupProgressList.map((g) => {
                const ratio = g.targetPot > 0 ? Math.min(100, Math.round((g.collected / g.targetPot) * 100)) : 0;
                return (
                  <div key={g.id} className="chart-bar-item">
                    <div className="chart-bar-labels">
                      <span className="chart-group-name">{g.name}</span>
                      <span className="chart-group-figures">
                        <span className="collected-num">{formatETB(g.collected)}</span> /{" "}
                        <span className="target-num">{formatETB(g.targetPot)}</span> ({ratio}%)
                      </span>
                    </div>
                    <div className="chart-track">
                      <div className="chart-fill" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      
        <section className="card card-gold-accent">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Upcoming Lottery Draws</h2>
              <p className="card-subtitle">Scheduled round draws requiring organizer execution.</p>
            </div>
            <Calendar size={18} className="stat-card-icon" />
          </div>

          {upcomingDraws.length === 0 ? (
            <div className="empty-sub-card">
              <p>No pending lottery draws scheduled at this time.</p>
            </div>
          ) : (
            <div className="upcoming-draws-list">
              {upcomingDraws.slice(0, 4).map((draw) => (
                <div key={draw.equbId} className="upcoming-draw-item">
                  <div className="draw-item-left">
                    <h3 className="draw-group-title">{draw.equbName}</h3>
                    <div className="draw-date-chip">
                      <Calendar size={13} />
                      <span>{formatDate(draw.dueDate)}</span>
                      <span>&middot;</span>
                      <span>
                        Cycle {draw.cycleNumber} &middot; Round {draw.roundNumber}
                      </span>
                    </div>
                  </div>
                  <div className="draw-item-right">
                    <span className="draw-pot-val">{formatETB(draw.pot)}</span>
                    <Link href={`/equbs/${draw.equbId}`} className="button button-sm button-secondary">
                      <span>View</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

    
      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Equb Cycle Progress Overview</h2>
            <p className="card-subtitle">
              Current cycle status, member rosters, and completion rates.
            </p>
          </div>
          <Link href="/equbs" className="button button-sm button-secondary">
            <span>Manage All Equbs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {groupProgressList.length === 0 ? (
          <div className="empty-state-box">
            <p>No Equb groups initialized yet.</p>
            <Link href="/equbs/new" className="button">
              Create an Equb
            </Link>
          </div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Equb Group</th>
                  <th>Frequency</th>
                  <th>Cycle Progress</th>
                  <th>Collected / Pot</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groupProgressList.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.name}</strong>
                    </td>
                    <td>{g.plan}</td>
                    <td>
                      Cycle {g.cycle} &middot; Round {g.roundNumber} of {g.totalRounds}
                    </td>
                    <td>
                      <span className="success-text font-bold">{formatETB(g.collected)}</span> /{" "}
                      <span className="gold-text">{formatETB(g.targetPot)}</span>
                    </td>
                    <td>
                      {g.isPaused ? (
                        <span className="badge badge-waiting">Paused</span>
                      ) : g.complete ? (
                        <span className="badge badge-primary">Completed</span>
                      ) : (
                        <span className="badge badge-primary">Active</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/equbs/${g.id}`} className="button button-sm button-secondary">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Historical Activity */}
      {recentActivities.length > 0 && (
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Recent Financial Activity</h2>
              <p className="card-subtitle">Audit trail of completed draws and distributed pots.</p>
            </div>
          </div>
          <div className="activity-feed">
            {recentActivities.slice(0, 5).map((act, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon-bubble">
                  <Trophy size={15} />
                </div>
                <div className="activity-text">
                  <strong className="activity-title">{act.title}</strong>
                  <p className="activity-desc">{act.desc}</p>
                </div>
                <span className="activity-time">{formatDateTime(act.date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
