import { getPostUserByUsername } from "@/actions/user";
import { UserInfoSection } from "@/components/pages/user/profile";
import { UserReplies } from "@/components/pages/user/replies";
import { auth } from "@/lib/auth";

export default async function UserRepliesPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const user = await getPostUserByUsername(username.split("40")[1]);
  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <div className="w-full max-w-[38rem] flex flex-col items-center">
        {user ? (
          <>
            <UserInfoSection user={user} />
            <UserReplies user={user} />
          </>
        ) : (
          <p>Not Found.</p>
        )}
      </div>
    </div>
  );
}
