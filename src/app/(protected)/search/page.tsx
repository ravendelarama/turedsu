import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SearchPage() {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }

  return <div>Search Page (Coming soon)</div>;
}
