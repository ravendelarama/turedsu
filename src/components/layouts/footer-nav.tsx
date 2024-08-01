"use client";

import { getPostUserByID } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { GoHome, GoHomeFill } from "react-icons/go";
import Link from "next/link";
import { PostFormModal } from "../pages/post/create-post";
import { FaHeart, FaRegHeart, FaRegUser, FaUser } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { CreatePostDrawer } from "../pages/post/create-post-mobile";

export default function FooterNav() {
  const session = useSession();
  const { data } = useQuery({
    queryKey: ["user", session?.data?.user?.id!],
    queryFn: async () => {
      return await getPostUserByID(session?.data?.user?.id! ?? "");
    },
  });
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex justify-evenly items-center py-2 sticky bottom-0 z-30 md:hidden bg-background/80 backdrop-blur">
      <Button
        variant={null}
        size={null}
        className="h-full hover:bg-primary-foreground py-2 px-4"
        asChild
      >
        <Link href="/">
          {pathname == "/" ? (
            <GoHomeFill className="h-6 w-6" />
          ) : (
            <GoHome className="h-6 w-6 text-zinc-600" />
          )}
        </Link>
      </Button>
      <Button
        variant={null}
        size={null}
        className="h-full hover:bg-primary-foreground py-2 px-4 "
        asChild
      >
        <Link href="/search">
          <Search
            className={cn("h-6 w-6", pathname != "/search" && "text-zinc-600")}
          />
        </Link>
      </Button>
      {/* <PostFormModal type="post" /> */}
      <CreatePostDrawer />
      <Button
        variant={null}
        size={null}
        className="h-full hover:bg-primary-foreground py-2 px-4"
        asChild
      >
        <Link href="/activity">
          {pathname == "/activity" ? (
            <FaHeart className="h-6 w-6" />
          ) : (
            <FaRegHeart className="h-6 w-6 text-zinc-600" />
          )}
        </Link>
      </Button>
      <Button
        variant={null}
        size={null}
        className="h-full hover:bg-primary-foreground py-2 px-4"
        asChild
      >
        <Link
          href={session.data && data?.username! ? `/@${data?.username}` : "/"}
        >
          {/\/@[a-z0-9_\.]+/.test(pathname) ? (
            <FaUser className="h-6 w-6" />
          ) : (
            <FaRegUser className="h-6 w-6 text-zinc-600" />
          )}
        </Link>
      </Button>
    </div>
  );
}
