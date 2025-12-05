// components/AuthGuardServer.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthGuardProps {
  children: ReactNode;
  redirectIfAuthenticated?: boolean;
  protectedRoute?: boolean;
  redirectAuthenticatedTo?: string;
  redirectUnauthenticatedTo?: string;
}

export default async function AuthGuardServer({
  children,
  redirectIfAuthenticated = false,
  protectedRoute = false,
  redirectAuthenticatedTo = "/timesheets",
  redirectUnauthenticatedTo = "/auth/login",
}: AuthGuardProps) {
  const jwt = (await cookies()).get("jwt")?.value;

  if (redirectIfAuthenticated && jwt) {
    return redirect(redirectAuthenticatedTo);
  }

  if (protectedRoute && !jwt) {
    return redirect(redirectUnauthenticatedTo);
  }

  return <>{children}</>;
}
