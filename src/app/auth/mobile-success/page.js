import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { redirect } from "next/navigation";

/**
 * Mobile Auth Success Page
 * 
 * This page is the callback destination for Google OAuth when initiated from the Android app.
 * It extracts the publicToken from the authenticated session and redirects back to the app
 * via deep link.
 * 
 * Flow:
 * 1. User completes Google OAuth
 * 2. NextAuth redirects here
 * 3. We extract publicToken from session
 * 4. We redirect to: consistencygrid://login-success?token=XXX
 * 5. Android app captures the deep link
 * 6. App saves token and reloads WebView with auto-login
 */
export default async function MobileAuthSuccessPage() {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    // If no session or no token, redirect to login with error
    if (!session?.user?.publicToken) {
        redirect("/login?error=AuthFailed");
    }

    const token = session.user.publicToken;
    const deepLink = `consistencygrid://login-success?token=${token}`;

    // Server-side page that immediately redirects via meta refresh
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Login Successful</title>
                {/* Immediate redirect to deep link */}
                <meta httpEquiv="refresh" content={`0;url=${deepLink}`} />
                <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #fffaf1 0%, #fff 100%);
          }
          .container {
            text-align: center;
            padding: 40px;
          }
          .success-icon {
            width: 64px;
            height: 64px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-center;
            margin: 0 auto 20px;
            animation: scaleIn 0.3s ease-out;
          }
          .success-icon svg {
            width: 32px;
            height: 32px;
            stroke: white;
            stroke-width: 3;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111;
            margin: 0 0 12px;
          }
          p {
            color: #666;
            margin: 0 0 24px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.2s;
          }
          .button:hover {
            background: #ea580c;
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
        `}</style>
            </head>
            <body>
                <div className="container">
                    <div className="success-icon">
                        <svg fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1>Login Successful!</h1>
                    <p>Redirecting you back to the app...</p>
                    <a href={deepLink} className="button">
                        Open App Manually
                    </a>
                </div>
            </body>
        </html>
    );
}
