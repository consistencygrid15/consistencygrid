/**
 * Secure API Route Helper - Simplified
 * Provides basic authentication for API routes
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";

/**
 * Get authenticated user from session
 */
export async function getAuthenticatedUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: "Unauthorized", user: null };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { error: "User not found", user: null };
    }

    return { error: null, user };
  } catch (error) {
    console.error("Auth error:", error);
    return { error: "Authentication failed", user: null };
  }
}
