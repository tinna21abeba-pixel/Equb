import Link from "next/link";
import { EQUB_PLANS } from "@/lib/plans";
import { formatETB } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader"; 
import {ShieldCheck,Trophy, Users, Wallet,ArrowRight,CheckCircle2,Lock,Layers,Sparkles,} from "lucide-react";


export const metadata = {
  title: { absolute: "Equb - Ethiopian Financial Savings & Lottery Management System" },
  description:
    "Advanced Ethiopian Equb management web application. Configure daily, weekly, biweekly and monthly Equb plans with verifiable lottery draws.",
};

const steps = [
  {
    icon: Users,
    title: "1. Gather the Group",
    text: "Select one of six standardized Equb plans and register participants with verified Ethiopian phone numbers.",
  },
  {
    icon: Wallet,
    title: "2. Track Round Collections",
    text: "Log member contributions in Ethiopian Birr (ETB), capture bank transaction references, and monitor unpaid members.",
  },
  {
    icon: Trophy,
    title: "3. Execute Fair Server Lottery",
    text: "Trigger server-validated random lottery draws. Exactly one winner per draw; duplicate winners are mathematically prevented.",
  },
  {
    icon: Layers,
    title: "4. Complete Cycle & Reset",
    text: "Once every member has won once, the cycle is marked complete and archived. A new cycle can begin with refreshed eligibility.",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>

        <section className="hero">
           <div className="hero-overlay"></div>
          <div className="hero-content">
          <h1>Simplify Your Equb. Strengthen Trust.</h1>
          <p>
           Empowering Ethiopia's most trusted savings tradition. 
           Transform your Equb with digital transparency, tamper-proof records, 
           fair automated lottery draws, and secure payout tracking—bringing confidence 
           and convenience to every member.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="button">
              <span>Start Your Equb</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/signin" className="button button-secondary">
              Sign In to Account
            </Link>
          </div>
          </div>
        </section>

        {/* 6 Plans Showcase */}
        <section className="dashboard-main-viewport" style={{ paddingBottom: "3rem" }}>
          <div className="card-header-row" style={{ textAlign: "center", display: "block" }}>
            <h2 className="page-title">Six Standardized Equb Plans</h2>
            <p className="page-subtitle">
              Engineered for Ethiopian communities, neighborhood associations, and workplace circles.
            </p>
          </div>

          <div className="plan-selection-grid">
            {EQUB_PLANS.map((plan) => (
              <div key={plan.id} className="plan-card-option">
                <div className="plan-card-header">
                  <span className="plan-tier-label">{plan.tier}</span>
                  <span className="spec-value gold">{formatETB(plan.targetPool)}</span>
                </div>
                <h3 className="plan-card-name">{plan.name}</h3>
                <p className="plan-card-desc">{plan.description}</p>
                <div className="plan-card-specs">
                  <div className="spec-row">
                    <span className="spec-label">Contribution:</span>
                    <span className="spec-value highlight">{formatETB(plan.contributionAmount)}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Frequency:</span>
                    <span className="spec-value">{plan.lotteryFrequency}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Capacity:</span>
                    <span className="spec-value">{plan.maxMembers} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

    
          <div className="card" style={{ marginTop: "3rem" }}>
            <h2 className="card-title">How the Equb Cycle Operates</h2>
            <p className="card-subtitle">
              A transparent, 4-stage governance process ensuring financial accountability.
            </p>
            <ol className="steps">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.title}>
                    <div className="brand-icon-box" style={{ marginBottom: "0.75rem" }}>
                      <Icon size={18} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>

      <footer>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <p>
            Ethiopian Equb Management & Financial System &middot; All monetary values formatted in Ethiopian
            Birr (ETB).
          </p>
        </div>
      </footer>
    </>
  );
}