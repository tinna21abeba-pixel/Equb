"use client";

export default function ErrorPage({ reset }) {
  return (
    <div className="card">
      <h1>Something went wrong</h1>
      <p>This page could not be loaded. Your data has not been changed.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}