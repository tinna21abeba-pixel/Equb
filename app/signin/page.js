import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import PublicHeader from "@/components/PublicHeader";
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
      <PublicHeader />
      <main className="narrow">
        <div className="card">
          <h1 className="card-title">Sign in</h1>
          <p className="card-subtitle">Access your account to manage your equb groups and rounds</p>
          <ActionForm
            action={signIn}
            fields={signInFields}
            submit="Sign in"
            hidden={{ next: safeNext(next) }}
          />
          <p className="hint">
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </main>
    </>
  );
}