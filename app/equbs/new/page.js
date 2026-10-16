import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import { createEqub } from "@/app/actions";
import { equbFields } from "@/lib/fields";
import { requireUser } from "@/lib/session";

export const metadata = { title: "New equb" };

export default async function NewEqubPage() {
  await requireUser();

  return (
    <div className="narrow">
      <Link href="/equbs" className="back-link">
        Back to all equbs
      </Link>
      <div className="card">
        <h1 className="card-title">Create new equb</h1>
        <p className="card-subtitle">
          Configure contribution details, collection frequency, and winner selection method.
        </p>
        <ActionForm action={createEqub} fields={equbFields} submit="Create equb" />
      </div>
    </div>
  );
}