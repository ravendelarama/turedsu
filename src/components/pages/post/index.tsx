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
import { Separator } from "@/components/ui/separator";
import TextParser from "../text-parser";
import {
  deletePost,
  getPostCounts,
  isLikedPost,
  likePost,
} from "@/actions/post";
import { useMutation, useQuery } from "@tanstack/react-query";
import { followUser, getPostUserByID, isFollowed } from "@/actions/user";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PostFormModal } from "./create-post";
import numeral from "numeral";
import { toast } from "sonner";

export type PostUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  bio: string | null;
  verified: boolean;
  _count: {
    followedBy: number;
  };
};

export type PostItemType = {
  id: string;
  caption: string;
  parentId: string | null;
  repostId: string | null;
  quoteId: string | null;
  userId: string;
  user: PostUser;
  createdAt: Date;
  medias: {
    id: string;
    key: string;
    name: string;
    source: string;
    type: string;
    aspectRatio: string;
    postId: string;
  }[];
  _count: {
    likes: number;
    replies: number;
    reposts: number;
    quotedBy: number;
  };
};

// Post Item Section
export function PostItemHoverCard({
  user,
  type,
}: {
  user: PostUser;
  type: "bio" | "caption" | "header";
}) {
  const { data } = useQuery({
    queryKey: ["followed", user.id],
    queryFn: async () => {
      return await isFollowed(user.id);
    },
  });
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
        >
          <Link
            href={`/@${user?.username!}`}
            className={cn(
              "text-sm md:text-base",
              type != "header" && "text-sky-500"
            )}
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
              followUser(user.id).then((res) => {
                toast.info(res.message);
              });
            }}
          >
            {data ? "Following" : "Follow"}
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
  const { data: liked } = useQuery({
    queryKey: ["liked", id],
    queryFn: async () => await isLikedPost(id),
    refetchInterval: 5 * 1000,
  });

  const { data: session } = useSession();

  return (
    <div
      className="flex gap-1 items-center py-2 px-3 hover:bg-primary-foreground rounded-full scale-1 transition-all duration-100 ease-in hover:scale-90"
      onClick={async (e) => {
        e.stopPropagation();

        if (type == "like" && session?.user) {
          await likePost(id);
        }
      }}
    >
      {type == "like" &&
        (!session?.user! || !liked ? (
          <Heart className="h-5 w-5" />
        ) : (
          <FaHeart className="h-5 w-5 text-red-600" />
        ))}
      {type == "comment" && <MessageCircle className="h-5 w-5" />}
      {type == "repost" && <RefreshCw className="h-5 w-5" />}
      <p
        className={cn(
          "text-xs",
          type == "like" && session?.user && liked && "text-red-600"
        )}
      >
        {count}
      </p>
    </div>
  );
}

export function PostActionSection({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ["post", id, "counts"],
    queryFn: async () => {
      return await getPostCounts(id);
    },
    refetchInterval: 5 * 1000,
    staleTime: 0,
  });

  const reposts = data?._count?.reposts! + data?._count?.quotedBy! || 0;
  return (
    <div className="select-none flex justify-start items-center w-full py-2 relative -left-3">
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
    </div>
  );
}

export function PostCaption({ caption }: { caption: string }) {
  return (
    <div className="text-sm whitespace-pre-line break-all">
      <TextParser text={caption} />
    </div>
  );
}

export function PostOptionSection({ id }: { id: string }) {
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
        <DropdownMenuItem className="rounded-xl p-3" asChild>
          <Button
            variant={null}
            size={null}
            className="flex justify-between items-center w-full focus-visible:ring-0"
          >
            Save <Bookmark className="w-6 h-6" />
          </Button>
        </DropdownMenuItem>
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
              await deletePost(id);
            }}
          >
            Delete
            <Trash className="w-6 h-6" />
          </Button>
        </DropdownMenuItem>
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
            <TooltipTrigger className="text-sm md:text-base text-zinc-500 ml-2">
              {moment(createdAt).fromNow()}
            </TooltipTrigger>
            <TooltipContent>
              <p>{moment(createdAt).calendar()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <PostOptionSection id={id} />
    </div>
  );
}

export function PostAvatarSection({
  id,
  user,
}: {
  id: string;
  user: PostUser;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={`/@${user?.username!}`}
      className={cn(
        "select-none min-h-full flex flex-col justify-start items-center pt-2 px-2 space-y-1 relative",
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
      {/* {pathname.includes("post") && pathname.includes(id) && (
        <Separator orientation="vertical" className="w-0.5 h-5/6 relative" />
      )} */}
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

export function Post({ post }: { post: PostItemType }) {
  const router = useRouter();

  const pathname = usePathname();
  return (
    <div
      className={cn(
        "flex min-w-full min-h-[5rem] h-full cursor-pointer",
        pathname.includes(post.id) && "py-5"
      )}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/@${post.user.username}/post/${post.id}`);
      }}
    >
      {/* Avatar Thread Section */}
      <PostAvatarSection user={post.user} id={post.id} />
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
