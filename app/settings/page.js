import { requireUser } from "@/lib/session";
import { EQUB_PLANS } from "@/lib/plans";
import { formatETB } from "@/lib/format";
import {
  Settings,
  ShieldCheck,
  User,
  Layers,
  Database,
  Lock,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "System Settings",
  description: "Governance, plan parameters, and organizer configurations.",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="settings-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">System Settings & Governance</h1>
          <p className="page-subtitle">
            Centralized Equb plan definitions, administrator access controls, and operational policies.
          </p>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Organizer Account */}
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Organizer Profile & Credentials</h2>
              <p className="card-subtitle">Authenticated administrative operator</p>
            </div>
            <User size={18} className="stat-card-icon" />
          </div>

          <div className="profile-details-grid">
            <div className="profile-row">
              <span className="profile-label">Full Name:</span>
              <span className="profile-value">{user.name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email Address:</span>
              <span className="profile-value">{user.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Administrative Role:</span>
              <span className="badge badge-primary">
                <ShieldCheck size={12} />
                <span>Authorized Organizer</span>
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Authorization Guard:</span>
              <span className="text-sm text-muted">Server-enforced session cookies</span>
            </div>
          </div>
        </section>

        {/* Currency & Financial Standards */}
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Financial & Currency Standards</h2>
              <p className="card-subtitle">Monetary formatting and verification rules</p>
            </div>
            <Database size={18} className="stat-card-icon" />
          </div>

          <div className="profile-details-grid">
            <div className="profile-row">
              <span className="profile-label">Base Currency:</span>
              <span className="profile-value">Ethiopian Birr (ETB)</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Number Formatting:</span>
              <span className="profile-value">Standard Ethiopian Birr (ETB)</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Lottery Execution:</span>
              <span className="badge badge-primary">Cryptographically Secure (Server)</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Concurrency Protection:</span>
              <span className="text-sm text-muted">Sequential Promise Queue Mutex</span>
            </div>
          </div>
        </section>
      </div>

      {/* Centralized 6 Equb Plans Configuration */}
      <section className="card card-gold-accent" style={{ marginTop: "1.5rem" }}>
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Standardized 6 Equb Plans Configuration</h2>
            <p className="card-subtitle">
              Centralized plan schemas. Values for Plan 5 (Standard) and Plan 6 (Premium) are configurable defaults.
            </p>
          </div>
          <Layers size={18} className="stat-card-icon" />
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Tier</th>
                <th>Contribution</th>
                <th>Frequency</th>
                <th>Member Capacity</th>
                <th>Target Round Pool</th>
                <th>Configurability</th>
              </tr>
            </thead>
            <tbody>
              {EQUB_PLANS.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong>{plan.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-gold">{plan.tier}</span>
                  </td>
                  <td className="font-bold text-primary">{formatETB(plan.contributionAmount)}</td>
                  <td>{plan.lotteryFrequency}</td>
                  <td>{plan.maxMembers} members</td>
                  <td className="gold-text font-bold">{formatETB(plan.targetPool)}</td>
                  <td>
                    {plan.isMembershipConfigurable || plan.isContributionConfigurable ? (
                      <span className="badge badge-primary">Configurable Defaults</span>
                    ) : (
                      <span className="badge badge-muted">Standard Fixed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
