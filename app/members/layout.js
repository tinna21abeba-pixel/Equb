import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Member Management",
  description: "Manage registered Equb participants and track their participation records.",
};

export default async function MembersLayout({ children }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
