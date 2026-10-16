import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="bar">
      <div className="bar-inner">
        <Link href="/" className="brand" aria-label="Equb home">
          Equb
        </Link>
        <nav className="nav-group" aria-label="Main navigation">
          <Link href="/signin" className="nav-link">
            Sign in
          </Link>
          <Link href="/signup" className="button button-sm">
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}
