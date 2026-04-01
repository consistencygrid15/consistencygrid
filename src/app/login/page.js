import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/authOptions";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

/**
 * Login Page (Server Side)
 * 
 * Handles authentication redirection before rendering the login form.
 * If the user is already logged in, they are redirected to the dashboard.
 */
export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/dashboard");
    }

    return <LoginForm />;
}
