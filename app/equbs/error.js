"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }) {
  return (
    <div className="card note-box" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div className="note-icon-wrap" style={{ color: "var(--danger)" }}>
        <AlertCircle size={22} />
      </div>
      <div>
        <h2 className="card-title">An unexpected error occurred</h2>
        <p className="card-subtitle">
          This operation could not be completed. Your records and account state remain safe and unchanged.
        </p>
        <button type="button" onClick={reset} className="button button-sm button-secondary">
          <RefreshCw size={14} />
          <span>Retry Operation</span>
        </button>
      </div>
    </div>
  );
}