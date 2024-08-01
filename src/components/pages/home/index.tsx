"use client";

import { getPosts, getPostsByTag } from "@/actions/post";
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
    queryFn: async () => await getPosts({ pageParams: 0 }),
  });

  return (
    <div className="w-full max-w-[36rem] flex flex-col justify-start items-center relative">
      {!isLoading &&
        data?.data &&
        data?.data?.length! > 0 &&
        data.data?.map((item, index) => (
          <>
            <Post post={item} />
            {data?.data?.length! > index - 1 && (
              <Separator orientation="horizontal" />
            )}
          </>
        ))}
    </div>
  );
}
