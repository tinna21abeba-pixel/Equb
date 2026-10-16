"use client";

import { useEffect, useState } from "react";
import { formatETB } from "@/lib/format";

export default function RoundProgress({ equbId, initial }) {
  const [status, setStatus] = useState(initial);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    setStatus(initial);
  }, [initial]);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/equbs/${equbId}/status`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to refresh contribution status");
        setStatus(await response.json());
        setUpdateError("");
      } catch {
        setUpdateError("Live updates are temporarily unavailable. Refresh the page to try again.");
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [equbId]);

  const percentage = status.members > 0 ? Math.round((status.paid / status.members) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-label">
          {status.paid} of {status.members} members paid
        </span>
        <span className="progress-percent">{percentage}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={status.paid}
        aria-valuemin={0}
        aria-valuemax={status.members || 1}
        aria-label="Contributions collected"
      >
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress-sub">
        <span>{formatETB(status.collected)} collected</span>
        <span>Target {formatETB(status.pot)}</span>
      </div>
      {updateError && (
        <p className="hint update-warning" role="status">
          {updateError}
        </p>
      )}
    </div>
  );
}