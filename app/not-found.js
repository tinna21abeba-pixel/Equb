import Link from "next/link";

export default function NotFound() {
  return (
    <main className="narrow">
      <div className="card empty-state">
        <h1 className="card-title">Page not found</h1>
        <p className="card-subtitle">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="button button-sm">
          Back to home
        </Link>
      </div>
    </main>
  );
}