"use client";

/** Last-resort boundary (e.g. the API is unreachable while rendering the layout). */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-NG">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#FAF7F2", color: "#1B2A4A", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Pickova is temporarily unavailable</h1>
          <p style={{ marginBottom: 24, opacity: 0.75 }}>We&apos;re having trouble loading the store. Please try again shortly.</p>
          <button type="button" onClick={reset} style={{ background: "#F28C28", color: "#fff", border: 0, borderRadius: 999, padding: "12px 28px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
