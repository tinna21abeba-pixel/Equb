import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import { signIn } from "@/app/actions";
import { signInFields } from "@/lib/fields";
import { getUser } from "@/lib/session";
import { safeNext } from "@/lib/redirect";

export const metadata = {
  title: "Sign in",
  description: "Sign in to manage your Equb groups, contributions and payouts.",
};

export default async function SignInPage({ searchParams }) {
  const { next } = await searchParams;
  if (await getUser()) redirect(safeNext(next));

  return (
    <>
  
      <main className="narrow">
        <div className="card card-emerald-accent">
          <div className="card-header-row" style={{ marginBottom: "0.5rem" }}>
            <h1 className="card-title">Organizer Sign In</h1>
            <div className="brand-icon-box" style={{ width: "30px", height: "30px" }}>
              <Lock size={15} />
            </div>
          </div>
          <p className="card-subtitle">Access your account to manage your Equb groups, members, and lottery rounds.</p>
          <ActionForm
            action={signIn}
            fields={signInFields}
            submit="Sign in"
            hidden={{ next: safeNext(next) }}
          />
          <p className="hint" style={{ marginTop: "1rem", textAlign: "center" }}>
            New organizer? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </main>
    </>
  );
}