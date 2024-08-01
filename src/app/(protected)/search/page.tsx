import SearchResults from "@/components/pages/search/results";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SearchPage() {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <SearchResults />
    </div>
  );
}
