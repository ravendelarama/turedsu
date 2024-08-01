"use client";

import { getPostsByTag } from "@/actions/post";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Post } from "../post";
import { Separator } from "@/components/ui/separator";

export default function SearchResults() {
  const search = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["search", search.get("type"), search.get("q")],
    queryFn: async () => await getPostsByTag(search.get("q") as string),
  });

  return (
    <div className="w-full max-w-[36rem]">
      {!isLoading ? (
        data?.map((item, index) => (
          <>
            <Post post={item} />
            {data.length > index - 1 && <Separator orientation="horizontal" />}
          </>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
