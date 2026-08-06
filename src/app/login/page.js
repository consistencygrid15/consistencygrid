import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

/**
 * Login Page (Server Side)
 * 
 * Code preserved, UI redirected to homepage.
 */
export default async function LoginPage() {
    redirect("/");
    return <LoginForm />;
}
