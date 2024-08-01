"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { PostItemHoverCard } from "./post";
import { getPostUserByUsername } from "@/actions/user";
import { useState } from "react";
import UsernameCaptionWrapper from "./username-caption-wrapper";
import { regex } from "@/lib/utils";

export default function TextParser({ text }: { text: string }) {
  const parts = text.split(regex.text);

  const parsed = parts.map((part, index) => {
    if (regex.username.test(part)) {
      const src = part.match(regex.username);
      if (src) {
        return <UsernameCaptionWrapper key={index} username={src[1]} />;
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
            <Link href={`/search?type=tag&q=${src[1]}`}>#{src[1]!}</Link>
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
            className="text-sm inline text-ellipsis overflow-hidden w-48"
            asChild
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link href={src[1]!} target="_" className="text-sky-500 inline">
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
