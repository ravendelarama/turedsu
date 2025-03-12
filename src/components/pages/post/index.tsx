"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaHeart } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdVerified } from "react-icons/md";
import moment from "moment";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import Link from "next/link";
import {
  Bookmark,
  ChevronRight,
  Ellipsis,
  Eye,
  Heart,
  HeartOff,
  LucideRefreshCw,
  MessageCircle,
  Pin,
  PinOff,
  Quote,
  RefreshCw,
  Trash,
} from "lucide-react";
// import { Separator } from "@/components/ui/separator";
import TextParser from "../text-parser";
import {
  deletePost,
  getPostCounts,
  isLikedPost,
  likePost,
} from "@/actions/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followUser, isFollowed } from "@/actions/user";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PostFormModal } from "./create-post";
import numeral from "numeral";
import { useOptimistic, useTransition } from "react";
import { PostItemType, PostUser } from "@/lib/thread-types";
import { Separator } from "@/components/ui/separator";

// Post Item Section
export function PostItemHoverCard({
  user,
  type,
}: {
  user: PostUser;
  type: "bio" | "caption" | "header";
}) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["followed", user.id],
    queryFn: async () => {
      return await isFollowed(user.id);
    },
  });
  const [follow, setFollow] = useOptimistic(data, (state, action: boolean) => {
    return action;
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return await followUser(user.id);
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["follow", user.id],
      });
    },
  });

  const [isPending, startTransition] = useTransition();

  const { data: session } = useSession();

  return (
    <HoverCard>
      <HoverCardTrigger className="text-sm cursor-pointer" asChild>
        <Button
          size={null}
          variant={"link"}
          className="inline-block"
          onClick={(e) => {
            e.stopPropagation();
          }}
          asChild
          disabled={isPending}
        >
          <Link
            href={`/@${user?.username!}`}
            className={cn("text-sm", type != "header" && "text-sky-500")}
          >
            {type != "header" && "@"}
            {user?.username!}
          </Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-[20rem] rounded-2xl space-y-4 p-5">
        <div
          className="select-none flex justify-between items-center w-full"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link href={`/@${user?.username!}`}>
            <p className="text-xl md:text-2xl font-semibold">{user?.name}</p>
            <p className="text-sm md:text-base">{user?.username!}</p>
          </Link>
          <Avatar className="select-none w-16 h-16">
            <AvatarImage src={user?.image!} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="select-none text-sm space-y-2">
          <p className="whitespace-pre-line">{user?.bio}</p>
          <p className="text-zinc-500">
            {numeral(user?._count.followedBy).format("0a")} Followers
          </p>
        </div>
        {session && session?.user?.id != user.id && (
          <Button
            variant={data ? "outline" : "default"}
            className="select-none w-full font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              startTransition(() => {
                setFollow(!follow);
                mutation.mutate();
              });
            }}
          >
            {follow ? "Following" : "Follow"}
          </Button>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export function PostActionButton({
  type,
  count = 0,
  id,
}: {
  type: "like" | "comment" | "repost";
  count?: number;
  id: string;
}) {
  const queryClient = useQueryClient();
  const { data: liked, isLoading } = useQuery({
    queryKey: ["liked", id],
    queryFn: async () => await isLikedPost(id),
  });

  const { data: session } = useSession();

  const [likes, setLikes] = useOptimistic(
    count,
    (state, action: "like" | "dislike") => {
      if (action == "like") {
        return state + 1;
      }
      if (action == "dislike" && state > 0) {
        return state - 1;
      }
      return 0;
    }
  );

  const mutation = useMutation({
    onMutate: async (newStat) => {
      await queryClient.cancelQueries({ queryKey: ["liked", id] });
      await queryClient.cancelQueries({
        queryKey: ["post", id, "counts"],
      });

      const prev = queryClient.getQueryData(["liked", id]);

      queryClient.setQueryData(["liked", id], (old: boolean) => !old);

      setLikes(!liked ? "like" : "dislike");

      return { prev, newStat };
    },
    mutationFn: async () => {
      return await likePost(id);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["liked", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["post", id, "counts"],
      });
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["liked", id], context?.prev);
    },
  });

  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="flex gap-1 items-center py-2 px-3 hover:bg-primary-foreground rounded-full scale-1 transition-all duration-100 ease-in hover:scale-90"
      onClick={async (e) => {
        e.stopPropagation();

        if (
          !isPending &&
          !mutation.isPending &&
          type == "like" &&
          session?.user
        ) {
          startTransition(() => {
            mutation.mutate();
          });
        }
      }}
    >
      {type == "like" &&
        (!session?.user! || !liked || isLoading ? (
          <Heart className="h-5 w-5" />
        ) : (
          <FaHeart className="h-5 w-5 text-red-600" />
        ))}
      {type == "comment" && <MessageCircle className="h-5 w-5" />}
      {type == "repost" && <RefreshCw className="h-5 w-5" />}
      <p
        className={cn(
          "text-xs",
          type == "like" && "hover:red-600",
          type == "like" && session?.user && liked && "text-red-600"
        )}
      >
        {type == "like" ? !isPending && likes : count}
      </p>
    </div>
  );
}

export function PostActionSection({ id }: { id: string }) {
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ["post", id, "counts"],
    queryFn: async () => {
      return await getPostCounts(id);
    },
    staleTime: Infinity
  });

  const reposts = data?._count?.reposts! + data?._count?.quotedBy! || 0;
  return (
    <div className="select-none flex justify-start items-center py-4 w-full relative -left-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="hover:text-red-600">
            <PostActionButton type="like" count={data?._count.likes} id={id} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Like</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PostFormModal type="comment" replyId={id} />

      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger>
                <PostActionButton type="repost" count={reposts} id={id} />
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Repost</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent className="p-2 rounded-xl w-64">
          <DropdownMenuItem className="rounded-xl p-3" asChild>
            <Button
              variant={null}
              size={null}
              className="flex justify-between items-center w-full focus-visible:ring-0"
            >
              Repost <LucideRefreshCw className="w-6 h-6" />
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl p-3" asChild>
            <Button
              variant={null}
              size={null}
              className="flex justify-between items-center w-full focus-visible:ring-0"
            >
              Quote <Quote className="w-6 h-6" />
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {pathname.includes("post") && pathname.includes(id) && (
        <>
          <div className="w-full h-full flex justify-end items-center text-zinc-600 text-xs gap-1">
            <Eye className="h-4 w-4" />
            {numeral(data?._count.views).format("0a")}
            {/* {data && data?._count.views != 1 && "s"} */}
          </div>
        </>
      )}
    </div>
  );
}

export function PostCaption({ caption }: { caption: string }) {
  return (
    <div className="text-sm whitespace-pre-line break-words">
      <TextParser text={caption} />
    </div>
  );
}

export function PostOptionSection({
  id,
  userId,
}: {
  userId: string;
  id: string;
}) {
  const mutation = useMutation({
    mutationFn: async () => {
      return await deletePost(id);
    },
  });

  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger
              className="hover:bg-primary-foreground p-2 rounded-full cursor-pointer"
              asChild
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Ellipsis className="w-5 h-5 text-zinc-600" />
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>More</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent className="p-2 rounded-xl w-64">
        {session && session?.user && (
          <>
            <DropdownMenuItem className="rounded-xl p-3" asChild>
              <Button
                variant={null}
                size={null}
                className="flex justify-between items-center w-full focus-visible:ring-0"
              >
                Save <Bookmark className="w-6 h-6" />
              </Button>
            </DropdownMenuItem>
            {session.user.id == userId && (
              <>
                <DropdownMenuItem className="rounded-xl p-3" asChild>
                  <Button
                    variant={null}
                    size={null}
                    className="flex justify-between items-center w-full focus-visible:ring-0"
                  >
                    Pin to profile
                    {false ? (
                      <PinOff className="w-6 h-6" />
                    ) : (
                      <Pin className="w-6 h-6" />
                    )}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl p-3" asChild>
                  <Button
                    variant={null}
                    size={null}
                    className="flex justify-between items-center w-full focus-visible:ring-0"
                  >
                    Hide like and share
                    {false ? (
                      <HeartOff className="w-6 h-6" />
                    ) : (
                      <Heart className="w-6 h-6" />
                    )}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl p-3 relative" asChild>
                  <div
                    className="flex justify-between items-center w-full focus-visible:ring-0"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Who can reply and quote
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl p-3" asChild>
                  <Button
                    variant={null}
                    size={null}
                    className="flex justify-between items-center w-full focus-visible:ring-0 text-destructive focus:text-red-500"
                    onClick={async (e) => {
                      e.stopPropagation();
                      mutation.mutate();
                    }}
                  >
                    Delete
                    <Trash className="w-6 h-6" />
                  </Button>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PostHeaderSection({
  id,
  user,
  createdAt,
}: {
  id: string;
  user: PostUser;
  createdAt: Date;
}) {
  return (
    <div className="select-none flex justify-between items-center w-full">
      <div className="flex items-center gap-1">
        <PostItemHoverCard type="header" user={user!} />
        {user?.verified! && <MdVerified className="text-sky-500" />}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-sm text-zinc-500 ml-2">
              {moment(createdAt).fromNow()}
            </TooltipTrigger>
            <TooltipContent>
              <p>{moment(createdAt).calendar()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <PostOptionSection id={id} userId={user.id} />
    </div>
  );
}

export function PostAvatarSection({
  id,
  user,
  withReply,
}: {
  id: string;
  user: PostUser;
  withReply: boolean;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={`/@${user?.username!}`}
      className={cn(
        "select-none min-h-full flex flex-col justify-start items-center pt-2 px-2 space-y-2 relative",
        pathname.includes(id) && "pt-0"
      )}
    >
      <Avatar>
        <AvatarImage src={user?.image!} />
        <AvatarFallback>
          {user?.name?.charAt(0)}
          {user?.name?.charAt(1)}
        </AvatarFallback>
      </Avatar>
      {withReply && (
        <Separator orientation="vertical" className="w-0.5 h-[84%]" />
      )}
    </Link>
  );
}

export function PostAttachments({ post }: { post: PostItemType }) {
  if (post.medias.length > 0) {
    return (
      <ScrollArea className="max-h-[36rem] w-full whitespace-nowrap py-2 relative -left-3">
        <ScrollBar orientation="horizontal" className="cursor-grabbing" />
        <div className="flex justify-start items-center space-x-2 py-2">
          {post.medias.map((item) => (
            <Image
              width={300}
              height={300}
              src={item.source}
              alt={item.name}
              key={item.id}
              className="object-cover border rounded-lg"
              draggable="false"
            />
          ))}
        </div>
      </ScrollArea>
    );
  }
  return null;
}

export function Post({
  post,
  withReply,
}: {
  post: PostItemType;
  withReply: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={"flex min-w-full min-h-[5rem] h-full cursor-pointer pt-2"}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/@${post.user.username}/post/${post.id}`);
      }}
    >
      {/* Avatar Thread Section */}
      <PostAvatarSection user={post.user} id={post.id} withReply={withReply} />
      {/* Header Section */}
      <div className={cn("flex flex-col w-full")}>
        <PostHeaderSection
          id={post.id!}
          user={post.user!}
          createdAt={post.createdAt}
        />
        {/* {headerChildren} */}
        <div>
          {/* Caption Section */}
          <PostCaption caption={post.caption!} />
          <PostAttachments post={post} />
          <PostActionSection id={post.id} />
        </div>
      </div>
    </div>
  );
}
