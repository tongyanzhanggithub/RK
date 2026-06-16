export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";
}

export function absoluteUrl(path: string) {
  const base = siteUrl().replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** BreadcrumbList structured data from [{ name, path }] crumbs. */
export function breadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path)
    }))
  };
}
