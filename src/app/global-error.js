"use client";

/**
 * Global Error Handler - Shows the REAL error message for debugging
 * This replaces the generic "Something went wrong" with the actual technical error.
 * IMPORTANT: Remove or update this once the bug is fixed.
 */
export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body style={{ fontFamily: "monospace", padding: "20px", background: "#fff0f0" }}>
                <h1 style={{ color: "red", fontSize: "18px" }}>⚠️ App Error (Debug Mode)</h1>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                    {error?.message || "Unknown error"}
                </p>
                <pre style={{
                    background: "#111",
                    color: "#f00",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    overflowX: "auto",
                    marginTop: "10px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all"
                }}>
                    {error?.stack || "No stack trace available"}
                </pre>
                <button
                    onClick={reset}
                    style={{
                        marginTop: "16px",
                        padding: "10px 20px",
                        background: "#f97316",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}
                >
                    Try Again
                </button>
            </body>
        </html>
    );
}
