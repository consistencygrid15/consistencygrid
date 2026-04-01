import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/authOptions";
import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";

/**
 * Signup Page (Server Side)
 * 
 * Handles authentication redirection before rendering the signup form.
 * If the user is already logged in, they are redirected to the dashboard.
 */
export default async function SignupPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return <SignupForm />;
}
