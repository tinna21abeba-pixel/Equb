import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import PublicHeader from "@/components/PublicHeader";
import { signUp } from "@/app/actions";
import { signUpFields } from "@/lib/fields";
import { getUser } from "@/lib/session";

export const metadata = {
  title: "signup",
  description: "Create an organizer account to establish your Equb savings circles.",
};

export default async function SignUpPage() {
  if (await getUser()) redirect("/equbs");

  return (
    <>
     
      <main className="narrow">
        <div className="card card-gold-accent">
          <div className="card-header-row" style={{ marginBottom: "0.5rem" }}>
            <h1 className="card-title">Register Organizer Account</h1>
            <div className="brand-icon-box" style={{ width: "30px", height: "30px" }}>
              <UserPlus size={15} />
            </div>
          </div>
          <p className="card-subtitle">Set up your account to start organizing community and workplace Equb groups.</p>
          <ActionForm action={signUp} fields={signUpFields} submit="Create Account" />
          <p className="hint" style={{ marginTop: "1rem", textAlign: "center" }}>
            Already registered? <Link href="/signin">Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}