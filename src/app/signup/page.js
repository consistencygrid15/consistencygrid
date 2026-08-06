import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";

/**
 * Signup Page (Server Side)
 * 
 * Code preserved, UI redirected to homepage.
 */
export default async function SignupPage() {
  redirect("/");
  return <SignupForm />;
}
