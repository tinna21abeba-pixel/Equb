import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Contributions & Payments",
  description: "Track receivables, collection rates, and member contributions in Ethiopian Birr.",
};

export default async function ContributionsLayout({ children }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
