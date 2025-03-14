"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Heart,
  LogOut,
  Search,
  SquarePlus,
  User,
} from "lucide-react";
import { GoHome, GoHomeFill } from "react-icons/go";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { BsThreads } from "react-icons/bs";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { logout } from "@/actions/auth";
import { toast } from "sonner";
import { PostFormModal } from "../pages/post/create-post";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { getPostUserByID } from "@/actions/user";
import AuthButtonGroup from "../pages/auth/auth-button";

export default function HeaderLayoutPage() {
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
    <div className="z-10 flex h-fit w-full px-10 py-2 md:px-24 md:h-[5rem] bg-background/80 backdrop-blur sticky top-0 text-foreground justify-between items-center">
      <Button variant={null} size={null} className="grow lg:grow-0" asChild>
        <Link href="/" className="bg-clip-text bg-rose-500">
          <BsThreads className=" h-8 w-8 bg-transparent" />
        </Link>
      </Button>
      <div className="w-1/3 h-full hidden justify-center items-center gap-4 relative left-8 lg:flex">
        {pathname.includes("post") && (
          <Button
            variant={null}
            size={null}
            onClick={(e) => {
              e.stopPropagation();
              router.back();
            }}
            className="text-zinc-600 hover:bg-primary-foreground hover:text-primary rounded-full p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
        <Button
          variant={null}
          size={null}
          className="h-full py-3 px-6 hover:bg-primary-foreground"
          asChild
        >
          <Link href="/">
            {pathname == "/" ? (
              <GoHomeFill className="h-7 w-7" />
            ) : (
              <GoHome className="h-7 w-7 text-zinc-600" />
            )}
          </Link>
        </Button>
        <Button
          variant={null}
          size={null}
          className="h-full hover:bg-primary-foreground py-3 px-6"
          asChild
        >
          <Link href="/search">
            <Search
              className={cn(
                "h-7 w-7",
                pathname != "/search" && "text-zinc-600"
              )}
            />
          </Link>
        </Button>
        <PostFormModal type="post" />
        <Button
          variant={null}
          size={null}
          className="h-full hover:bg-primary-foreground py-3 px-6"
          asChild
        >
          <Link href="/activity">
            {pathname == "/activity" ? (
              <FaHeart className="h-7 w-7" />
            ) : (
              <FaRegHeart className="h-7 w-7 text-zinc-600" />
            )}
          </Link>
        </Button>
        <Button
          variant={null}
          size={null}
          className="h-full hover:bg-primary-foreground py-3 px-6"
          asChild
        >
          <Link
            href={session.data && data?.username! ? `/@${data?.username}` : "/"}
          >
            {/\/@[a-z0-9_\.]+/.test(pathname) ? (
              <FaUser className="h-6 w-7" />
            ) : (
              <FaRegUser className="h-6 w-7 text-zinc-600" />
            )}
          </Link>
        </Button>
      </div>
      <AuthButtonGroup />
    </div>
  );
}
