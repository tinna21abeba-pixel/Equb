import Link from "next/link";
import { signOut } from "@/app/actions";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "My equbs",
  robots: { index: false, follow: false },
};

export default async function EqubsLayout({ children }) {
  const user = await requireUser();

  return (
    <>
      <header className="bar">
        <div className="bar-inner">
          <Link href="/equbs" className="brand">
            Equb
          </Link>
          <nav className="nav-group">
            <Link href="/equbs" className="nav-link">
              Dashboard
            </Link>
            <Link href="/equbs/new" className="button button-sm">
              New equb
            </Link>
            <div className="nav-user">
              <span className="user-name">{user.name}</span>
              <form action={signOut}>
                <button type="submit" className="signout-button">
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </div>
      </header>
      <main className="page">{children}</main>
    </>
  );
}