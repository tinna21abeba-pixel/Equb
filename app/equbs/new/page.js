import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewEqubForm from "@/components/NewEqubForm";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Create New Equb",
  description: "Select an Ethiopian Equb plan and configure members, frequency, and rules.",
};

export default async function NewEqubPage() {
  await requireUser();

  return (
    <div className="new-equb-page-wrap">
      <Link href="/equbs" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Equb Groups</span>
      </Link>

      <div className="page-header-block">
        <h1 className="page-title">Establish New Equb</h1>
        <p className="page-subtitle">
          Configure a trustworthy rotating savings group tailored for your community or workplace.
        </p>
      </div>

      <NewEqubForm />
    </div>
  );
}