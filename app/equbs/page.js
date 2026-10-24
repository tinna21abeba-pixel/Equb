import Link from "next/link";
import { PlusCircle, Layers, Users, Wallet, Trophy } from "lucide-react";
import { listEqubs } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { currentRound, dueDate, statusOf } from "@/lib/equb";
import { formatETB } from "@/lib/format";
import EqubListFilters from "@/components/EqubListFilters";

export const metadata = {
  title: "Equb Groups",
  description: "Manage your rotating savings circles, view capacity, and track contributions.",
};

export default async function EqubsPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  const statuses = {};
  const dueDates = {};
  let totalMembers = 0;
  let totalPot = 0;
  let totalCollected = 0;
  let activeGroupsCount = 0;

  for (const equb of equbs) {
    const status = statusOf(equb);
    statuses[equb.id] = status;
    const round = currentRound(equb);
    if (round) {
      dueDates[equb.id] = dueDate(equb, round.number);
    }
    totalMembers += equb.members.length;
    totalPot += status.pot || 0;
    totalCollected += status.collected || 0;
    if (!status.complete) activeGroupsCount++;
  }

  return (
    <div className="equbs-page-container">
      {/* Top Banner & Action */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Equb Groups</h1>
          <p className="page-subtitle">
            Overview and governance of all registered community rotating savings circles.
          </p>
        </div>
        <Link href="/equbs/new" className="button">
          <PlusCircle size={16} />
          <span>New Equb</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Equbs</span>
            <Layers size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{activeGroupsCount}</div>
          <div className="stat-card-hint">
            {equbs.length} total registered {equbs.length === 1 ? "group" : "groups"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Enrolled Members</span>
            <Users size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{totalMembers}</div>
          <div className="stat-card-hint">Across all active savings groups</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Target Round Pool</span>
            <Wallet size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{formatETB(totalPot)}</div>
          <div className="stat-card-hint">Combined expected round pot</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Collected Funds</span>
            <Trophy size={18} className="stat-card-icon" />
          </div>
          <div className="stat-card-value">{formatETB(totalCollected)}</div>
          <div className="stat-card-hint">Verified contributions this cycle</div>
        </div>
      </div>

      {/* Filterable Equb List */}
      <EqubListFilters equbs={equbs} statuses={statuses} dueDates={dueDates} />
    </div>
  );
}