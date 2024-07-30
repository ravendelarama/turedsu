import HeaderLayoutPage from "@/components/layouts/header";
import MainPageLayout from "@/components/layouts/main";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <HeaderLayoutPage />
      <MainPageLayout>{children}</MainPageLayout>
      <Toaster richColors />
    </div>
  );
}
