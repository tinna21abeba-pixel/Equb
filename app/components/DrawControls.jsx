"use client";

import { useState } from "react";
import { formatETB, formatDate } from "@/lib/format";
import { drawWinner, toggleDrawPause, startNewCycle } from "@/app/actions";
import {
  Trophy,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Wallet,
  Users,
} from "lucide-react";

export default function DrawControls({ equb, status, round, eligibleCount, dueDateVal }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isPaused = Boolean(equb.drawPaused);
  const hasMinMembers = equb.members.length >= 2;
  const isReady = Boolean(round) && hasMinMembers && eligibleCount > 0 && !isPaused;
  const cycleComplete = equb.members.length >= 2 && eligibleCount === 0 && !round;

  const handleDrawConfirm = async () => {
    setIsPending(true);
    try {
      await drawWinner(equb.id);
      setShowConfirm(false);
    } finally {
      setIsPending(false);
    }
  };

  const handleTogglePause = async () => {
    setIsPending(true);
    try {
      await toggleDrawPause(equb.id);
    } finally {
      setIsPending(false);
    }
  };

  const handleStartNextCycle = async () => {
    setIsPending(true);
    try {
      await startNewCycle(equb.id);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="draw-controls-panel">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-icon-wrap">
                <Trophy size={22} className="modal-trophy-icon" />
              </div>
              <div>
                <h3 id="modal-title" className="modal-title">
                  Confirm Lottery Draw
                </h3>
                <p className="modal-desc">
                  Select a winner fairly for Round {round?.number} (Cycle {equb.currentCycle || 1}).
                </p>
              </div>
            </div>

            <div className="modal-summary-box">
              <div className="modal-row">
                <span className="modal-label">Eligible Candidates:</span>
                <span className="modal-val highlight">{eligibleCount} members</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Collected Round Funds:</span>
                <span className="modal-val success">{formatETB(status.collected)}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Expected Target Pot:</span>
                <span className="modal-val gold">{formatETB(status.pot)}</span>
              </div>
            </div>

            {status.collected < status.pot && (
              <div className="modal-warning-banner">
                <AlertCircle size={16} className="modal-warning-icon" />
                <span>
                  Notice: Round funds are partially collected ({formatETB(status.collected)} of{" "}
                  {formatETB(status.pot)}). Payout status will be recorded as pending.
                </span>
              </div>
            )}

            <div className="modal-actions-row">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-gold"
                onClick={handleDrawConfirm}
                disabled={isPending}
              >
                {isPending ? "Executing Draw..." : "Execute Lottery Draw"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Draw Action Bar */}
      <div className="draw-action-bar">
        <div className="draw-meta-info">
          <div className="draw-meta-chip">
            <Calendar size={14} />
            <span>Due {formatDate(dueDateVal)}</span>
          </div>
          <div className="draw-meta-chip">
            <Users size={14} />
            <span>{eligibleCount} eligible candidates</span>
          </div>
          <div className="draw-meta-chip">
            <Wallet size={14} />
            <span>Target Pot {formatETB(status.pot)}</span>
          </div>
        </div>

        <div className="draw-buttons-cluster">
          {/* Pause / Resume Button */}
          {round && (
            <button
              type="button"
              className={`button button-sm ${isPaused ? "button-secondary" : "button-secondary"}`}
              onClick={handleTogglePause}
              disabled={isPending}
              title={isPaused ? "Resume scheduled draw" : "Pause draw until payments settle"}
            >
              {isPaused ? (
                <>
                  <PlayCircle size={15} />
                  <span>Resume Draw</span>
                </>
              ) : (
                <>
                  <PauseCircle size={15} />
                  <span>Pause Draw</span>
                </>
              )}
            </button>
          )}

          {/* Trigger Draw Button */}
          {round && (
            <button
              type="button"
              className="button button-gold"
              onClick={() => setShowConfirm(true)}
              disabled={!isReady || isPending}
            >
              <Trophy size={16} />
              <span>
                {equb.drawMethod === "lottery" ? "Execute Lottery Draw" : "Pay Next Member"}
              </span>
            </button>
          )}

          {/* Start New Cycle Button */}
          {cycleComplete && (
            <button
              type="button"
              className="button button-gold"
              onClick={handleStartNextCycle}
              disabled={isPending}
            >
              <RefreshCw size={16} />
              <span>Start Cycle {(equb.currentCycle || 1) + 1}</span>
            </button>
          )}
        </div>
      </div>

      {/* Advisory Messages */}
      {isPaused && (
        <div className="draw-advisory-banner warning">
          <PauseCircle size={16} />
          <span>Draw is paused by the organizer. Resume draw once outstanding payments are settled.</span>
        </div>
      )}

      {!hasMinMembers && (
        <div className="draw-advisory-banner info">
          <AlertCircle size={16} />
          <span>Add at least two registered members to initiate the lottery cycle.</span>
        </div>
      )}

      {round && !status.allPaid && !isPaused && (
        <p className="draw-policy-hint">
          Organizers may proceed with the draw or pause until all {equb.members.length} members have
          completed their contributions.
        </p>
      )}
    </div>
  );
}
