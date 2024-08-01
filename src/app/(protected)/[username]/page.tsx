import { getPostUserByUsername } from "@/actions/user";
import { UserInfoSection, UserThreads } from "@/components/pages/user/profile";
import type { Metadata, ResolvingMetadata } from "next";

export default async function UserPage({
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
            <UserThreads user={user} />
          </>
        ) : (
          <p>Not Found.</p>
        )}
      </div>
    </div>
  );
}
