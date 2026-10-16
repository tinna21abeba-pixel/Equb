import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(site),
  title: { default: "Equb - Save together", template: "%s | Equb" },
  description: "Run your Equb online. Track contributions in Birr, draw winners fairly and keep every round on record.",
  openGraph: {
    title: "Equb - Save together",
    description: "Track contributions in Birr, draw winners fairly and keep every round on record.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}