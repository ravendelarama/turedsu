"use client";

import { getPostsByTag } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Post } from "../post";
import { Separator } from "@/components/ui/separator";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { FaThreads } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import LoadingPrompt from "../loading-prompt";

export default function SearchResults() {
  const search = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["search", search.get("type"), search.get("q")],
    queryFn: async () => await getPostsByTag(search.get("q") as string),
  });

  return (
    <div className="w-full max-w-[36rem] flex flex-col justify-start items-center relative">
      {!isLoading &&
        search.get("q") &&
        search.get("type") &&
        data?.map((item, index) => (
          <>
            <Post post={item} withReply={false} />
            {data.length > index - 1 && <Separator orientation="horizontal" />}
          </>
        ))}
    </div>
  );
}
