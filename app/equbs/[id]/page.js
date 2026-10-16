import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import RoundProgress from "@/components/RoundProgress";
import { addMember, deleteEqub, drawWinner, removeMember, togglePayment } from "@/app/actions";
import { memberFields } from "@/lib/fields";
import { requireUser } from "@/lib/session";
import { findEqub } from "@/lib/queries";
import { currentRound, dueDate, frequencyLabels, isLocked, statusOf } from "@/lib/equb";
import { formatDate, formatDateTime, formatETB } from "@/lib/format";

export default async function EqubPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const equb = await findEqub(user.id, id);
  if (!equb) notFound();

  const status = statusOf(equb);
  const round = currentRound(equb);
  const locked = isLocked(equb);
  const ready = Boolean(round) && equb.members.length >= 2 && status.paid === equb.members.length;
  const history = equb.rounds.filter((item) => item.winnerId);
  const wonIn = new Map(history.map((item) => [item.winnerId, item.number]));
  const nameOf = (memberId) => equb.members.find((member) => member.id === memberId)?.name ?? "Removed member";

  return (
    <>
      <Link href="/equbs" className="back-link">
        Back to all equbs
      </Link>
      <div className="page-intro">
        <h1 className="page-title">{equb.name}</h1>
        <p className="page-subtitle">
          {formatETB(equb.amount)} {frequencyLabels[equb.frequency]} &middot; {equb.members.length} {equb.members.length === 1 ? "member" : "members"}
        </p>
      </div>

      <dl className="stats">
        <div>
          <dt>Contribution</dt>
          <dd>{formatETB(equb.amount)}</dd>
        </div>
        <div>
          <dt>Frequency</dt>
          <dd>{frequencyLabels[equb.frequency]}</dd>
        </div>
        <div>
          <dt>Pot per round</dt>
          <dd>{formatETB(status.pot)}</dd>
        </div>
        <div>
          <dt>Selection</dt>
          <dd>{equb.drawMethod === "lottery" ? "Lottery draw" : "Sequential order"}</dd>
        </div>
      </dl>

      {round ? (
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">
                Round {round.number} of {equb.members.length || 1}
              </h2>
              <p className="card-subtitle">Due {formatDate(dueDate(equb, round.number))}</p>
            </div>
          </div>
          <RoundProgress equbId={equb.id} initial={status} />
          <form action={drawWinner.bind(null, equb.id)}>
            <button type="submit" disabled={!ready}>
              {equb.drawMethod === "lottery" ? "Draw winner" : "Pay out next member"}
            </button>
          </form>
          {!ready && (
            <p className="hint">
              {equb.members.length < 2
                ? "Add at least two members to begin."
                : "Every member must pay before the pot can be paid out."}
            </p>
          )}
        </section>
      ) : (
        <section className="card">
          <h2 className="card-title">Equb completed</h2>
          <p>Every member has received the pot once.</p>
        </section>
      )}

      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Members</h2>
            <p className="card-subtitle">
              {equb.members.length} {equb.members.length === 1 ? "participant" : "participants"} registered
            </p>
          </div>
        </div>

        {equb.members.length === 0 ? (
          <p>No members yet. Add the first member below.</p>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Phone</th>
                  <th>Contribution</th>
                  <th>Payout status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {equb.members.map((member) => {
                  const paid = Boolean(round?.payments[member.id]);
                  return (
                    <tr key={member.id}>
                      <td>
                        <strong>{member.name}</strong>
                      </td>
                      <td>{member.phone}</td>
                      <td>
                        {round ? (
                          <form action={togglePayment.bind(null, equb.id, member.id)}>
                            <button type="submit" className={paid ? "small paid" : "small"}>
                              {paid ? "Paid" : "Mark paid"}
                            </button>
                          </form>
                        ) : (
                          <span className="badge-payout">Done</span>
                        )}
                      </td>
                      <td>
                        {wonIn.has(member.id) ? (
                          <span className="badge-payout">Received in round {wonIn.get(member.id)}</span>
                        ) : (
                          <span className="badge-waiting">Pending</span>
                        )}
                      </td>
                      <td>
                        {!locked && (
                          <form action={removeMember.bind(null, equb.id, member.id)}>
                            <button type="submit" className="link">
                              Remove
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {locked ? (
        <p className="hint">Members list is locked because contributions have already started.</p>
      ) : (
        <section className="card">
          <h2 className="card-title">Add member</h2>
          <p className="card-subtitle">Enter participant details to add them to this equb circle.</p>
          <ActionForm action={addMember.bind(null, equb.id)} fields={memberFields} submit="Add member" />
        </section>
      )}

      {history.length > 0 && (
        <section className="card">
          <h2 className="card-title">Payout history</h2>
          <ol className="history-list">
            {history.map((item) => (
              <li key={item.number}>
                Round {item.number}: {nameOf(item.winnerId)} received {formatETB(status.pot)} on{" "}
                {formatDateTime(item.drawnAt)}
              </li>
            ))}
          </ol>
        </section>
      )}

      <details className="card">
        <summary>Delete this equb</summary>
        <p>This permanently removes the equb, its member roster, and all round history.</p>
        <form action={deleteEqub.bind(null, equb.id)}>
          <button type="submit" className="danger">
            Delete permanently
          </button>
        </form>
      </details>
    </>
  );
}