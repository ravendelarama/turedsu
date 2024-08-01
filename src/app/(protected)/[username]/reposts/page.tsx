import { getPostUserByUsername } from "@/actions/user";
import { UserInfoSection, UserThreads } from "@/components/pages/user/profile";
import { UserReposts } from "@/components/pages/user/reposts";

export default async function UserRepostPage({
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
            <UserReposts user={user} />
          </>
        ) : (
          <p>Not Found.</p>
        )}
      </div>
    </div>
  );
}
