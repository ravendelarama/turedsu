import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default async function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
