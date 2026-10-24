import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Financial Dashboard",
  description: "Executive Ethiopian Equb Financial Overview and Portfolio Analytics",
};

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
