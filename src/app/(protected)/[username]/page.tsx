import { getPostUserByUsername } from "@/actions/user";
import { UserInfoSection, UserThreads } from "@/components/pages/user/profile";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }

  const user = await getPostUserByUsername(username.split("@")[1]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <div className="w-full max-w-[38rem] flex flex-col items-center">
        <UserInfoSection user={user} />
        <UserThreads user={user} />
      </div>
    </div>
  );
}
