import { getPostUserByUsername } from "@/actions/user";
import { UserInfoSection, UserThreads } from "@/components/pages/user/profile";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params: { username }, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: `@${username.split("40").join("")[1]}`,
    applicationName: "Turedsu",
    creator: "RYBN",
    openGraph: {
      images: ["/vercel.svg"],
    },
  };
}

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
