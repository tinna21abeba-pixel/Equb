import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Payout History & Verification",
  description: "Audit completed pot disbursements, verification notes, and bank transfer receipts.",
};

export default async function PayoutsLayout({ children }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
