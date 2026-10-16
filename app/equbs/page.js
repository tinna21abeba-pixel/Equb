import Link from "next/link";
import { listEqubs } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { frequencyLabels, statusOf } from "@/lib/equb";
import { formatETB } from "@/lib/format";

export default async function EqubsPage() {
  const user = await requireUser();
  const equbs = await listEqubs(user.id);

  return (
    <>
      <div className="row">
        <div>
          <h1 className="page-title">Your equbs</h1>
          <p className="page-subtitle">Manage your rotating savings circles and track member contributions</p>
        </div>
        <Link href="/equbs/new" className="button">
          New equb
        </Link>
      </div>

      {equbs.length === 0 ? (
        <section className="card empty-state">
          <h2>No equbs created yet</h2>
          <p>Create your first rotating savings circle, invite members, and start tracking contributions.</p>
          <Link href="/equbs/new" className="button">
            Create an equb
          </Link>
        </section>
      ) : (
        <div className="grid">
          {equbs.map((equb) => {
            const status = statusOf(equb);
            const progress =
              status.members === 0
                ? "No members yet"
                : status.complete
                  ? "Completed"
                  : `Round ${status.round} of ${status.totalRounds}`;
            const badgeClass = status.complete
              ? "badge badge-primary"
              : status.members === 0
                ? "badge badge-muted"
                : "badge badge-primary";

            return (
              <Link key={equb.id} href={`/equbs/${equb.id}`} className="card tile">
                <div className="tile-top">
                  <div className="card-header-row">
                    <h2 className="tile-heading">{equb.name}</h2>
                    <span className={badgeClass}>{progress}</span>
                  </div>
                  <p className="tile-meta">
                    {formatETB(equb.amount)} {frequencyLabels[equb.frequency]}
                  </p>
                  <p className="tile-meta">
                    {equb.members.length} {equb.members.length === 1 ? "member" : "members"}
                  </p>
                </div>
                <div className="tile-bottom">
                  <span className="tile-pot-label">Total pot</span>
                  <span className="tile-pot-value">{formatETB(status.pot)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}