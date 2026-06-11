"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the whole document, so it must render its own <html>/<body> and can't rely on
 * the theme stylesheet — keep it minimal and self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#666", maxWidth: "28rem" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#2f7d32",
            color: "#fff",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
