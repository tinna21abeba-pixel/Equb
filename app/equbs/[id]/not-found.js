import Link from "next/link";

export default function EqubNotFound() {
  return (
    <div className="card empty-state">
      <h1 className="card-title">Equb not found</h1>
      <p className="card-subtitle">It may have been deleted, or it does not belong to your account.</p>
      <Link href="/equbs" className="button button-sm">
        Back to your equbs
      </Link>
    </div>
  );
}