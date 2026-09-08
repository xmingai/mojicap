// Root-level fallback 404 for requests that never receive a locale prefix.
// User-facing 404s render the localized src/app/[locale]/not-found.tsx instead.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 64, margin: 0 }}>🫥</p>
          <h1 style={{ fontSize: 28 }}>Page not found</h1>
          <p><a href="https://www.mojicap.com/" style={{ color: "#2563eb" }}>Go to MojiCap home</a></p>
        </div>
      </body>
    </html>
  );
}
