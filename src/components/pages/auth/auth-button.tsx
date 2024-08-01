"use client";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AuthButtonGroup() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      {session && session?.user ? (
        <form action={logout}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={null}
                  size={"lg"}
                  className="font-semibold"
                  type="submit"
                  onClick={(e) => {
                    toast.info("Signed out");
                    router.refresh();
                  }}
                >
                  <LogOut className="h-5 w-5 text-zinc-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>
      ) : (
        <Button
          variant={"default"}
          size={"sm"}
          className="font-semibold"
          asChild
        >
          <Link href="/signin">Log in</Link>
        </Button>
      )}
    </>
  );
}
