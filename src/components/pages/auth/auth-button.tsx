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
import { toast } from "sonner";

export default function AuthButtonGroup() {
  const { data: session } = useSession();

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
                  className="font-semibold hidden md:block"
                  type="submit"
                  onClick={(e) => {
                    toast.info("Signed out");
                  }}
                >
                  <LogOut className="h-7 w-7 text-zinc-500" />
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
          className="hidden font-semibold md:block"
          asChild
        >
          <Link href="/signin">Log in</Link>
        </Button>
      )}
    </>
  );
}
