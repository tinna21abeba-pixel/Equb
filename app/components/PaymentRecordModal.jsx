"use client";

import { useState } from "react";
import { formatETB } from "@/lib/format";
import { recordDetailedPayment } from "@/app/actions";
import { Receipt, X, CheckCircle2, Clock } from "lucide-react";

export default function PaymentRecordModal({ equbId, member, roundNumber, amountDue, currentRecord }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState(String(currentRecord?.amountPaid ?? amountDue));
  const [status, setStatus] = useState(currentRecord?.status ?? "paid");
  const [transactionRef, setTransactionRef] = useState(currentRecord?.transactionRef ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("memberId", member.id);
    formData.append("amountPaid", amountPaid);
    formData.append("status", status);
    formData.append("transactionRef", transactionRef);

    try {
      const res = await recordDetailedPayment(equbId, null, formData);
      if (res?.errors) {
        setError(Object.values(res.errors)[0]);
      } else {
        setIsOpen(false);
      }
    } catch (err) {
      setError(err?.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`button button-sm ${
          currentRecord?.status === "paid"
            ? "small paid"
            : currentRecord?.status === "partially_paid"
            ? "small"
            : "button-secondary small"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <Receipt size={13} />
        <span>
          {currentRecord?.status === "paid"
            ? "Paid"
            : currentRecord?.status === "partially_paid"
            ? `Partial (${formatETB(currentRecord.amountPaid)})`
            : "Record Pay"}
        </span>
      </button>

      {isOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-icon-wrap">
                <Receipt size={22} className="modal-receipt-icon" />
              </div>
              <div>
                <h3 className="modal-title">Record Member Contribution</h3>
                <p className="modal-desc">
                  {member.name} &middot; Round {roundNumber}
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

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-banner">{error}</div>}

              <div className="field">
                <label htmlFor={`amountPaid-${member.id}`}>Amount Paid (ETB)</label>
                <input
                  id={`amountPaid-${member.id}`}
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={amountPaid}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmountPaid(val);
                    if (Number(val) >= amountDue) setStatus("paid");
                    else if (Number(val) > 0) setStatus("partially_paid");
                  }}
                />
                <span className="hint">Required amount due: {formatETB(amountDue)}</span>
              </div>

              <div className="field">
                <label htmlFor={`status-${member.id}`}>Payment Status</label>
                <select
                  id={`status-${member.id}`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="paid">Paid (Full contribution)</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor={`ref-${member.id}`}>
                  Bank / Telebirr Transaction Reference
                </label>
                <input
                  id={`ref-${member.id}`}
                  type="text"
                  placeholder="e.g. CBE-TXN-98421 or Telebirr ID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
                <span className="hint">Optional internal audit reference</span>
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
                  {isSubmitting ? "Recording..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
