import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  return <div>Activity page (Comming soon)</div>;
}
