"use client";

import { getUserThreadReplies } from "@/actions/post";
import { PostUser } from "@/lib/thread-types";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Post } from "../post";
import { Separator } from "@/components/ui/separator";

export function UserReplies({ user }: { user: PostUser }) {
  const { data, isLoading } = useQuery({
    queryKey: [user.username, "replies"],
    queryFn: async () => {
      return await getUserThreadReplies(user.id!);
    },
    refetchInterval: 1000 * 10,
    staleTime: 10 * 1000,
  });

  return (
    <div className="w-full h-full flex flex-col items-center">
      {!isLoading &&
        data &&
        data?.map((item, index) => (
          <Fragment key={index}>
            <Post post={item.parent!} withReply />
            <Post
              post={{
                id: item.id,
                caption: item.caption,
                parentId: item.parentId,
                repostId: item.repostId,
                createdAt: item.createdAt,
                quoteId: item.quoteId,
                userId: item.userId,
                user: item.user!,
                medias: item.medias!,
                _count: item._count!,
              }}
              withReply={false}
            />
            {index != data.length - 1 && <Separator orientation="horizontal" />}
          </Fragment>
        ))}
    </div>
  );
}
