export default function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: site, lastModified: new Date() },
    { url: `${site}/signin`, lastModified: new Date() },
    { url: `${site}/signup`, lastModified: new Date() },
  ];
}