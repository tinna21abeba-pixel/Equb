import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export const metadata = {
  title: { absolute: "Equb - Save together, one pot at a time" },
  description:
    "Create an Equb for your friends, family or colleagues. Record contributions in Birr and draw the winner of each round fairly.",
};

const steps = [
  { title: "Gather the group", text: "Create your Equb and add each member with an Ethiopian phone number." },
  { title: "Collect each round", text: "Mark every member as paid when their contribution arrives." },
  { title: "Pay out the pot", text: "Draw a winner by lottery or follow the agreed order of members." },
  { title: "Repeat until done", text: "Past winners are excluded until every member has received the pot." },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero">
          <span className="hero-tag">Rotating Savings Circle</span>
          <h1>Run your Equb with complete clarity on every round</h1>
          <p>
            Equb is the rotating savings tradition where members contribute together and one member receives the full pot each round. Keep it organized, fair, and transparent.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="button">
              Start your Equb
            </Link>
            <Link href="/signin" className="button button-secondary">
              Sign in
            </Link>
          </div>
        </section>
        <section className="page">
          <h2 className="card-title">How it works</h2>
          <p className="card-subtitle">A straightforward four-step process for organizing community savings</p>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer>Equb savings organizer. All amounts in Ethiopian Birr (ETB).</footer>
    </>
  );
}