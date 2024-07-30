"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { PostItemHoverCard } from "./post";
import { useQuery } from "@tanstack/react-query";
import { getPostUserByUsername } from "@/actions/user";

export const regex = {
  text: /((?:@|#|https?:\/\/)(?:\[)?[\w=?&.\/\-_:\s]+(?:\]\()?[\w=?&.\/:\-_]+(?:\))?)/g,
  url: /(https?:\/\/(?:[a-z0-9\-]+\.)?[a-z0-9\-]+\.[a-z0-9]{2,4}(?:\/[a-z0-9\-]+)*(?:\?(?:[a-zA-Z0-9]+=[a-zA-Z0-9]+&?)+)?)/,
  username: /(?:@\[)([a-z0-9_]{3,})(?:\]\()([a-z0-9_]{3,})(?:\))/,
  tag: /(?:#\[)(\w+)(?:\]\()(\w+)(?:\))/,
};

export default function TextParser({ text }: { text: string }) {
  const parts = text.split(regex.text);

  const parsed = parts.map((part, index) => {
    if (regex.username.test(part)) {
      const src = part.match(regex.username);
      if (src) {
        const { data } = useQuery({
          queryKey: ["username", src[1]],
          queryFn: async () => {
            return await getPostUserByUsername(src[1].split("@")[1]);
          },
        });
        if (data) {
          return <PostItemHoverCard key={index} type="caption" user={data} />;
        }
      }
    }
    if (regex.tag.test(part)) {
      const src = part.match(regex.tag);

      if (src) {
        return (
          <Button
            key={index}
            variant={"link"}
            size={null}
            className="text-sky-500 text-sm inline-block"
            asChild
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link href="/search">#{src[1]!}</Link>
          </Button>
        );
      }
    }
    if (regex.url.test(part)) {
      const src = part.match(regex.url);

      if (src) {
        return (
          <Button
            key={index}
            variant={"link"}
            size={null}
            className="text-sm inline-block"
            asChild
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link href={src[1]!} target="_" className="text-sky-500">
              {src[1]!}
            </Link>
          </Button>
        );
      }
    }
    return part;
  });

  //   console.log(parsed);

  return parsed;
}
