"use client";

import { useState } from "react";
import { formatETB, formatDateTime } from "@/lib/format";
import { updatePayoutStatus } from "@/app/actions";
import { ShieldCheck, CheckCircle2, Clock, X, ExternalLink } from "lucide-react";

export default function PayoutVerificationModal({ equbId, payout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(payout.payoutStatus || "pending");
  const [transactionRef, setTransactionRef] = useState(payout.transactionRef || "");
  const [notes, setNotes] = useState(payout.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("payoutStatus", status);
    formData.append("transactionRef", transactionRef);
    formData.append("notes", notes);

    try {
      await updatePayoutStatus(equbId, payout.id, null, formData);
      setIsOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to update payout status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const badgeClass =
    payout.payoutStatus === "paid"
      ? "badge badge-payout"
      : payout.payoutStatus === "verified"
      ? "badge badge-primary"
      : "badge badge-waiting";

  return (
    <>
      <button
        type="button"
        className="button button-sm button-secondary"
        onClick={() => setIsOpen(true)}
      >
        <ShieldCheck size={13} />
        <span>Manage Payout</span>
      </button>

      {isOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-icon-wrap">
                <ShieldCheck size={22} className="modal-trophy-icon" />
              </div>
              <div>
                <h3 className="modal-title">Verify & Manage Payout</h3>
                <p className="modal-desc">
                  Round {payout.roundNumber} Winner: {payout.winnerName}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-summary-box">
              <div className="modal-row">
                <span className="modal-label">Payout Amount:</span>
                <span className="modal-val gold">{formatETB(payout.potAmount)}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Drawn On:</span>
                <span className="modal-val">{formatDateTime(payout.drawnAt)}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Current Status:</span>
                <span className={badgeClass}>{payout.payoutStatus}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-banner">{error}</div>}

              <div className="field">
                <label htmlFor={`payout-status-${payout.id}`}>Update Payout Status</label>
                <select
                  id={`payout-status-${payout.id}`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending (Draw recorded, awaiting verification)</option>
                  <option value="verified">Verified (Organizer approved, ready for transfer)</option>
                  <option value="paid">Paid (Disbursed to winner via bank/telebirr)</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor={`payout-txn-${payout.id}`}>
                  Bank / Transfer Reference
                </label>
                <input
                  id={`payout-txn-${payout.id}`}
                  type="text"
                  placeholder="e.g. CBE Transfer 100039219 or Cash receipt"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor={`payout-note-${payout.id}`}>Verification Notes</label>
                <textarea
                  id={`payout-note-${payout.id}`}
                  rows={2}
                  placeholder="e.g. Identity and account number verified with winner."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save Payout Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
