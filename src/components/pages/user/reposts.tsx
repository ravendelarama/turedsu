"use client";

import { PostUser } from "@/lib/thread-types";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Post } from "../post";
import { Separator } from "@/components/ui/separator";
import { getUserThreadReposts } from "@/actions/repost";

export function UserReposts({ user }: { user: PostUser }) {
  const { data, isLoading } = useQuery({
    queryKey: [user.username, "replies"],
    queryFn: async () => {
      return await getUserThreadReposts(user.id!);
    },
    refetchInterval: 1000 * 30,
  });

  return (
    <div className="w-full h-full flex flex-col items-center">
      {!isLoading &&
        data &&
        data?.map((item, index) => (
          <Fragment key={index}>
            <Post post={item.post!} withReply={false} />
            {index != data.length - 1 && <Separator orientation="horizontal" />}
          </Fragment>
        ))}
    </div>
  );
}
