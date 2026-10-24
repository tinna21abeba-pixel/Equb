"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB, formatDate } from "@/lib/format";
import { frequencyLabels } from "@/lib/equb";
import {
  Search,
  Filter,
  Users,
  Calendar,
  Wallet,
  ArrowRight,
  PlusCircle,
  PauseCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function EqubListFilters({ equbs, statuses, dueDates }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const filtered = useMemo(() => {
    return equbs
      .filter((equb) => {
        const matchesSearch =
          equb.name.toLowerCase().includes(search.toLowerCase()) ||
          (equb.planId || "").toLowerCase().includes(search.toLowerCase());

        const status = statuses[equb.id];
        let matchesStatus = true;
        if (filterStatus === "active") {
          matchesStatus = !status?.complete && !status?.drawPaused;
        } else if (filterStatus === "paused") {
          matchesStatus = Boolean(status?.drawPaused);
        } else if (filterStatus === "completed") {
          matchesStatus = Boolean(status?.complete);
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "amount") return b.amount - a.amount;
        if (sortBy === "members") return b.members.length - a.members.length;
        // Default: most recently created
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [equbs, statuses, search, filterStatus, sortBy]);

  return (
    <div className="equb-listing-container">
      {/* Controls Bar */}
      <div className="listing-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search Equb by title or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="filter-selects-row">
          <div className="select-pill-wrap">
            <Filter size={14} className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Rounds</option>
              <option value="paused">Draw Paused</option>
              <option value="completed">Completed Cycles</option>
            </select>
          </div>

          <div className="select-pill-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="recent">Recently Created</option>
              <option value="amount">Highest Contribution</option>
              <option value="members">Most Members</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Empty State */}
      {filtered.length === 0 ? (
        <div className="card empty-state-box">
          <div className="empty-state-icon">
            <Users size={36} />
          </div>
          <h3>No Equb Groups Found</h3>
          <p>
            {search || filterStatus !== "all"
              ? "No Equb groups match your filter criteria. Try adjusting your search term."
              : "You have not initialized any Equb rotating savings groups yet."}
          </p>
          <Link href="/equbs/new" className="button">
            <PlusCircle size={16} />
            <span>Create New Equb</span>
          </Link>
        </div>
      ) : (
        <div className="equbs-grid">
          {filtered.map((equb) => {
            const status = statuses[equb.id] || {};
            const nextDueDate = dueDates[equb.id];
            const capacity = equb.maxMembers || 50;
            const progressPercent =
              capacity > 0 ? Math.min(100, Math.round((equb.members.length / capacity) * 100)) : 0;

            const roundPaidPercent =
              status.members > 0 ? Math.round((status.paid / status.members) * 100) : 0;

            return (
              <Link key={equb.id} href={`/equbs/${equb.id}`} className="equb-card-tile">
                <div className="equb-card-top">
                  <div className="equb-header-line">
                    <h2 className="equb-name-title">{equb.name}</h2>
                    <div className="badge-wrapper">
                      {status.drawPaused ? (
                        <span className="badge badge-waiting">
                          <PauseCircle size={12} />
                          <span>Draw Paused</span>
                        </span>
                      ) : status.complete ? (
                        <span className="badge badge-primary">
                          <CheckCircle2 size={12} />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="badge badge-primary">
                          <span>
                            Cycle {status.cycle || 1} &middot; Rd {status.round || 1}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="equb-plan-meta">
                    <span className="equb-amount-highlight">{formatETB(equb.amount)}</span>
                    <span className="equb-frequency-pill">
                      {frequencyLabels[equb.frequency] || equb.frequency}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="equb-financial-strip">
                    <div className="financial-cell">
                      <span className="cell-label">Collected This Round</span>
                      <span className="cell-val success">{formatETB(status.collected || 0)}</span>
                    </div>
                    <div className="financial-cell">
                      <span className="cell-label">Target Round Pot</span>
                      <span className="cell-val gold">{formatETB(status.pot || 0)}</span>
                    </div>
                  </div>

                  {/* Round Payment Progress */}
                  <div className="mini-progress-section">
                    <div className="mini-progress-header">
                      <span>Round Contributions:</span>
                      <strong>
                        {status.paid} / {status.members} paid ({roundPaidPercent}%)
                      </strong>
                    </div>
                    <div className="mini-progress-track">
                      <div
                        className="mini-progress-fill"
                        style={{ width: `${roundPaidPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="equb-card-bottom">
                  <div className="card-meta-line">
                    <span className="meta-item">
                      <Users size={14} />
                      <span>
                        {equb.members.length} / {capacity} members
                      </span>
                    </span>
                    {nextDueDate && (
                      <span className="meta-item">
                        <Calendar size={14} />
                        <span>Draw {formatDate(nextDueDate)}</span>
                      </span>
                    )}
                  </div>
                  <span className="view-details-action">
                    <span>Manage</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
