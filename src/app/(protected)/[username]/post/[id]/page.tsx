import { addView, getPostByID, getReplies } from "@/actions/post";
import { Post } from "@/components/pages/post";
import { PostActivity } from "@/components/pages/post/post-activity";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Fragment } from "react";

export default async function PostPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await auth();
  const post = await getPostByID(id);

  if (session && post) {
    await addView(post?.id!, session.user?.id!);
  }

  const replies = await getReplies(id);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-[38rem]">
        {post ? (
          <>
            <Post post={post!} withReply={false} />
            <Separator orientation="horizontal" />
            <PostActivity id={post?.id!} />
            {replies.map((item, index) => (
              <Fragment key={item.id}>
                <Post post={item} withReply={false} />
                {replies.length > index + 1 && (
                  <Separator orientation="horizontal" />
                )}
              </Fragment>
            ))}
          </>
        ) : (
          <p className="text-6xl font-semibold font-sans text-center">
            Not found
          </p>
        )}
      </div>
    </div>
  );
}
