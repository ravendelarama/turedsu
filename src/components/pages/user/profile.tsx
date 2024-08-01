"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TextParser from "../text-parser";
import numeral from "numeral";
import { CircleEllipsis, Dot, Loader, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserThreadPosts } from "@/actions/post";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { followUser, isFollowed } from "@/actions/user";
import { toast } from "sonner";
import { Fragment, useOptimistic, useTransition } from "react";
import { PostUser } from "@/lib/thread-types";
import { Post } from "../post";
import { ProfileFormModal } from "./profile-form";

export function UserInfoSection({ user }: { user: PostUser }) {
  const { data: session } = useSession();

  return (
    <div className="w-full px-2 md:px-0">
      <div className="py-3 flex justify-between items-center">
        <UsernameGroup username={user?.username!} name={user?.name!} />
        <UserAvatarGroup avatar={user.image!} name={user.name!} />
      </div>
      <UserBio bio={user.bio} />
      <UserSocialGroup user={user} />
      {session && session?.user?.email == user?.email ? (
        <ProfileFormModal user={user} />
      ) : (
        session && <UserProfileButtonGroups user={user} />
      )}
      <UserPostNav user={user} />
    </div>
  );
}

export function UsernameGroup({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  return (
    <div className="grow">
      <p className="font-bold font-sans text-3xl">{name}</p>
      <p className="text-base">{username}</p>
    </div>
  );
}

export function UserAvatarGroup({
  avatar,
  name,
}: {
  name: string | null;
  avatar: string | null;
}) {
  return (
    <Avatar className="h-20 w-20 md:h-24 md:w-24 border cursor-pointer select-none">
      <AvatarImage src={avatar ?? ""} draggable="false" />
      <AvatarFallback>
        {name?.charAt(0).toUpperCase()}
        {name?.charAt(1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserBio({ bio }: { bio: string | null }) {
  return (
    <p className="text-sm whitespace-pre-line break-words">
      <TextParser text={bio ?? ""} />
    </p>
  );
}

export function UserSocialGroup({ user }: { user: PostUser }) {
  return (
    <div className="flex justify-between py-4">
      <div className="flex items-center gap-2">
        <p className="text-sm md:text-base text-zinc-600 hover:underline cursor-pointer select-none">
          {numeral(user._count.followedBy).format("0a")} followers
        </p>
        {user.link && (
          <>
            <Dot className="h-2 w-2 text-zinc-500" />
            <Link
              className="text-sm md:text-base text-zinc-600 hover:underline text-ellipsis w-36 lg:w-fit overflow-hidden lg:overflow-auto"
              href={user.link}
              target="_"
            >
              {user.link}
            </Link>
          </>
        )}
      </div>
      <div>
        <CircleEllipsis className="h-6 w-6" />
      </div>
    </div>
  );
}

export function UserPostNav({ user }: { user: PostUser }) {
  return (
    <div className="flex w-full select-none">
      <Link
        href={`/@${user.username}`}
        className="py-2 w-full text-center font-semibold text-base border-b border-primary"
      >
        Threads
      </Link>
      <Link
        href={`/@${user.username}/replies`}
        className="py-2 w-full text-center text-zinc-500 font-semibold text-base border-b"
      >
        Replies
      </Link>
      <Link
        href={`/@${user.username}/reposts`}
        className="py-2 w-full text-center text-zinc-500 font-semibold text-base border-b"
      >
        Reposts
      </Link>
    </div>
  );
}

export function UserThreads({ user }: { user: PostUser }) {
  const { data, isSuccess } = useQuery({
    queryKey: [user.username, "threads"],
    queryFn: async () => {
      return await getUserThreadPosts(user.id!);
    },
    refetchInterval: 1000 * 10,
    staleTime: 10 * 1000,
  });

  return (
    <div className="w-full h-full flex flex-col items-center">
      {isSuccess && data ? (
        data?.map((item, index) => (
          <Fragment key={index}>
            <Post post={item} />
            {index != data.length - 1 && <Separator orientation="horizontal" />}
          </Fragment>
        ))
      ) : (
        <LoaderCircle className="h-8 w-8 text-center animate-spin mt-10" />
      )}
    </div>
  );
}

export function UserProfileButtonGroups({ user }: { user: PostUser }) {
  const { data } = useQuery({
    queryKey: ["followed", user.id],
    queryFn: async () => {
      return await isFollowed(user.id);
    },
    refetchInterval: 3 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return await followUser(user.id);
    },
  });

  const [follow, setFollow] = useOptimistic(
    data,
    (_, action: boolean) => action
  );
  const [isPending, startTransition] = useTransition();

  return (
    <div className="py-2 w-full flex justify-between items-center gap-4">
      <Button
        variant={follow ? "outline" : "default"}
        className="grow"
        onClick={(e) => {
          e.stopPropagation();
          startTransition(() => {
            setFollow(!follow);
            mutation.mutate();
          });
        }}
        disabled={isPending}
      >
        {follow ? "Following" : "Follow"}
      </Button>
      <Button variant={"outline"} className="grow">
        Mention
      </Button>
    </div>
  );
}
