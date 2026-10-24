import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Lottery & Winner Draws",
  description: "Monitor cycle rounds, eligible candidates, and execute fair lottery draws on the server.",
};

export default async function LotteryLayout({ children }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
