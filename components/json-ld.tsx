/** Serialize JSON-LD safely: escape "<" so a string containing "</script>" can
 *  never break out of the <script> tag (defense-in-depth XSS protection). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Renders a JSON-LD structured-data script. Server component. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
