import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import PublicHeader from "@/components/PublicHeader";
import { signUp } from "@/app/actions";
import { signUpFields } from "@/lib/fields";
import { getUser } from "@/lib/session";

export const metadata = {
  title: "Create account",
  description: "Create a free account to organise your Equb and keep every round on record.",
};

export default async function SignUpPage() {
  if (await getUser()) redirect("/equbs");

  return (
    <>
      <PublicHeader />
      <main className="narrow">
        <div className="card">
          <h1 className="card-title">Create account</h1>
          <p className="card-subtitle">Set up your account to start organizing your rotating savings group</p>
          <ActionForm action={signUp} fields={signUpFields} submit="Create account" />
          <p className="hint">
            Already registered? <Link href="/signin">Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}