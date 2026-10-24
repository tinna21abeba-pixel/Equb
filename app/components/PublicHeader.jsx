import Link from "next/link";
import {School, ArrowRight } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="bar">
      <div className="bar-inner">
        <Link href="/" className="brand-lockup" aria-label="Equb home">
          <div className="brand-icon-box">
            <School className="brand-svg" size={20} />
          </div>
          <div>
            <span className="brand-title">Unity Equb</span>
            <span className="brand-subtitle">Financial System</span>
          </div>
        </Link>
        <nav className="nav-group" aria-label="Main navigation">
          <Link href="/signin" className="button button-sm button-secondary">
            Sign In
          </Link>
          <Link href="/signup" className="button button-sm button-gold">
            <span>Get Started</span>
            <ArrowRight size={14} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
