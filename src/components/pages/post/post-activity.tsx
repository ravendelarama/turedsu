"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function PostActivity({ id }: { id: string }) {
  return (
    <Button
      variant={null}
      size={null}
      className="w-full flex justify-between items-center text-zinc-600 py-2 text-sm border-b rounded-none px-2"
      onClick={(e) => {
        e.stopPropagation();
        toast.info("Post Activities");
      }}
    >
      <p className="font-semibold text-primary">Replies</p>
      <span className="flex gap-1 items-center">
        View activity <ChevronRight className={"h-5 w-5"} />
      </span>
    </Button>
  );
}
