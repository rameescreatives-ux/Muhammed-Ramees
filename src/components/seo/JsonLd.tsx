/**
 * Renders a JSON-LD block.
 *
 * The payload is always author-controlled data assembled from the content
 * layer — never user input — so serialising it directly is safe. `<` is
 * escaped so a stray sequence in copy can never close the script tag early.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
