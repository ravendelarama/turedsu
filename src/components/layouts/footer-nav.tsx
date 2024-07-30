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
    <div className="w-full h-fit bg-background/80 py-2 z-20 flex justify-evenly items-center sticky bottom-0 backdrop-blur lg:hidden">
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
      <PostFormModal type="post" />
      <Button
        variant={null}
        size={null}
        className="h-full hover:bg-primary-foreground py-2 px-4"
        asChild
      >
        <Link href="/activity">
          {pathname == "/activity" ? (
            <FaHeart className="h-5 w-5" />
          ) : (
            <FaRegHeart className="h-5 w-5 text-zinc-600" />
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
            <FaUser className="h-5 w-5" />
          ) : (
            <FaRegUser className="h-5 w-5 text-zinc-600" />
          )}
        </Link>
      </Button>
    </div>
  );
}
