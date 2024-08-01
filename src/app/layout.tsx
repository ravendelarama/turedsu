import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import TanstackQueryProvider from "@/providers/tanstack-query-provider";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import LoadingPrompt from "@/components/pages/loading-prompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Turedsu",
  description: "A Threads Clone Application",
  creator: "RYBN",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider session={session}>
          <ThemeProvider
            enableSystem
            defaultTheme="dark"
            disableTransitionOnChange
            attribute="class"
          >
            <TanstackQueryProvider>
              <Suspense fallback={<LoadingPrompt />}>
                <div className="min-h-screen w-full">{children}</div>
              </Suspense>
              <Toaster richColors />
            </TanstackQueryProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
