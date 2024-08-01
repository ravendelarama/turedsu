import { getPosts } from "@/actions/post";
import { Post } from "@/components/pages/post";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoaderCircle } from "lucide-react";
import { Fragment } from "react";

export default async function Home() {
  const { data: posts } = await getPosts({ pageParams: 0 });

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="w-full max-w-[38rem]">
        {posts ? (
          posts.map((post, index) => (
            <Fragment key={post.id!}>
              <Post post={post!} withReply={false} />
              {posts.length - 1 != index && (
                <Separator orientation="horizontal" />
              )}
            </Fragment>
          ))
        ) : (
          <LoaderCircle className="h-8 w-8 text-center animate-spin mt-10" />
        )}
      </div>
    </div>
  );
}
