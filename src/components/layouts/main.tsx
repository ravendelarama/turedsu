import { ReactNode } from "react";

export default function MainPageLayout({ children }: { children: ReactNode }) {
  return <div className="w-full min-h-screen">{children}</div>;
}
