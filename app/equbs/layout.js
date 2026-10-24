import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Equb Management",
  robots: { index: false, follow: false },
};

export default async function EqubsLayout({ children }) {
  const user = await requireUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}