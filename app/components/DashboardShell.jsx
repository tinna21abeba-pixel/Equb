"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";
import {LayoutDashboard,Layers,Users,Receipt,Trophy,History,Settings,PlusCircle,LogOut,Menu,X,Landmark,ShieldCheck,ChevronRight,} from "lucide-react";


const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/equbs", label: "Equb Groups", icon: Layers },
  { href: "/members", label: "Members", icon: Users },
  { href: "/contributions", label: "Contributions", icon: Receipt },
  { href: "/lottery", label: "Lottery & Draws", icon: Trophy },
  { href: "/payouts", label: "Payout History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({ user, children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-root">
    
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand-wrapper">
          <Link href="/dashboard" className="brand-lockup" onClick={() => setMobileOpen(false)}>
            <div className="brand-icon-box">
              <Landmark className="brand-svg" size={20} />
            </div>
            <div>
              <span className="brand-title"> Unity </span>
              
            </div>
          </Link>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard": pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <ChevronRight size={14} className="active-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar-initials">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "EQ"}
            </div>
            <div className="user-details">
              <span className="user-fullname">{user?.name || "Organizer"}</span>
              <span className="user-role-label">Equb Organizer</span>
            </div>
          </div>
          <form action={signOut} className="signout-form">
            <button type="submit" className="sidebar-signout-btn">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="dashboard-content-area">
        {/* Top Navigation Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumbs">
              <span className="breadcrumb-root">Equb</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-active">
                {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label || "Management"}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <Link href="/equbs/new" className="topbar-action-btn">
              <PlusCircle size={16} />
              <span>New Equb</span>
            </Link>
            <div className="topbar-user-badge">
              <span className="user-initial-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <span className="user-name-compact">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="dashboard-main-viewport">{children}</main>
      </div>
    </div>
  );
}
