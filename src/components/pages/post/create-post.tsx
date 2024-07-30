"use client";

import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  Hash,
  Images,
  MessageCircle,
  SquarePlus,
  X,
} from "lucide-react";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MentionsInput, Mention } from "react-mentions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { createPost, getPostCounts, uploadMediaFiles } from "@/actions/post";
import { getUserQuery } from "@/actions/user";
import { Input } from "@/components/ui/input";
import { PostActionButton } from ".";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const postFormSchema = z.object({
  threads: z.array(
    z.object({
      caption: z.string().optional(),
      medias: z.array(z.custom<File>()),
    })
  ),
});

// @ts-ignore
function getUserSuggestions(query, callback) {
  getUserQuery(String(query)).then((res) => {
    let results = res.map((result) => {
      return {
        id: result.username!,
        display: result?.username!,
      };
    });
    callback(results);
  });
}

// initial post form, to be modified
function PostCreateForm({
  setTrigger,
  replyId,
}: {
  setTrigger: Dispatch<SetStateAction<boolean>>;
  replyId?: string;
}) {
  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      threads: [
        {
          caption: "",
          medias: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "threads",
  });

  // File upload not working on sub threads
  async function onSubmit(values: z.infer<typeof postFormSchema>) {
    const formData = new FormData();

    console.log(values);

    if (replyId) {
      formData.append("replyId", replyId);
    }

    values.threads.map((item, index) => {
      formData.append(`threads.captions`, item.caption!);
      item.medias.map((m) => {
        formData.append(`threads.${index}.medias`, m, m.name);
      });
    });

    await createPost(formData);
    form.reset();
    setTrigger(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative w-full h-full p-2"
      >
        {fields.map((fields, index) => (
          <div key={fields.id}>
            <FormField
              control={form.control}
              name={`threads.${index}.caption`}
              render={({ field: { onBlur, onChange, value, ref } }) => (
                <FormItem>
                  <FormControl>
                    <MentionsInput
                      inputRef={ref}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      singleLine={false}
                      placeholder={index == 0 ? "Start a threads" : "Say more"}
                      className="text-sm focus:ring-0"
                      maxLength={500}
                    >
                      <Mention
                        displayTransform={(id, display) => `@${display}`}
                        trigger={"@"}
                        data={getUserSuggestions}
                        className="bg-blue-800"
                        appendSpaceOnAdd
                        renderSuggestion={(
                          suggestion,
                          search,
                          highlightedDisplay,
                          index,
                          focused
                        ) => {
                          return (
                            <div
                              className={cn(
                                "flex gap-2 bg-background w-64 hover:bg-zinc-800 px-4 py-2 text-foreground border-b",
                                index == 0 && "border-t",
                                focused && "bg-zinc-800"
                              )}
                            >
                              {/* <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar> */}
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                  @{suggestion.display}
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Mention
                        trigger={"#"}
                        data={[
                          {
                            id: "tagId",
                            display: "threads",
                          },
                        ]}
                        className="bg-blue-900"
                        renderSuggestion={(
                          entry,
                          search,
                          highligted,
                          index,
                          focused
                        ) => {
                          return (
                            <div
                              className={cn(
                                "flex gap-2 bg-background w-64 hover:bg-zinc-800 px-4 py-2 text-foreground border-b",
                                index == 0 && "border-t",
                                focused && "bg-zinc-800"
                              )}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                  @{entry.display}
                                </span>
                                <span className="text-sm text-zinc-500 font-normal">
                                  {entry.id}
                                </span>
                              </div>
                            </div>
                          );
                        }}
                        displayTransform={(id, display) => `#${display}`}
                        markup="#[__display__](__id__)"
                        appendSpaceOnAdd
                      />
                    </MentionsInput>
                  </FormControl>
                  <FormMessage />
                  <Button
                    variant={null}
                    size={null}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(index);
                    }}
                    className={cn("hidden", index > 0 && "block")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`threads.${index}.medias`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <Label htmlFor={`threads.${index}.medias`}>
                        <Images className="h-4 w-4 text-zinc-400" />
                      </Label>
                      <input
                        id={`threads.${index}.medias`}
                        type="file"
                        multiple
                        aria-hidden
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target?.files!);
                          form.setValue(
                            `threads.${index}.medias`,
                            // @ts-ignore
                            files as File[]
                          );
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button
          type="button"
          variant={null}
          size={null}
          onClick={() => append({ caption: "", medias: [] })}
          disabled={form.getValues()?.threads[0]?.caption?.length == 0}
        >
          Add a thread
        </Button>
        <div className="flex justify-end bottom-0 w-full bg-background p-2">
          <Button
            type="submit"
            disabled={form.getValues()?.threads[0]?.caption?.length == 0}
          >
            Post
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function PostFormModal({
  replyId,
  type,
}: {
  type: "comment" | "post";
  replyId?: string;
}) {
  const [trigger, setTrigger] = useState<boolean>(false);
  const [cancel, setCancel] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["post", replyId, "counts"],
    queryFn: async () => {
      return await getPostCounts(replyId);
    },
    refetchInterval: 5000,
    staleTime: 0,
  });

  return (
    <div className="relative">
      <PostModalTrigger
        setTrigger={setTrigger}
        type={type}
        count={data?._count.replies!}
      />
      <div
        className={cn(
          "bg-background/50 w-full h-screen justify-center items-center z-50 fixed inset-0 hidden",
          trigger && "flex"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setCancel(!cancel);
        }}
      >
        <PostCancelModal
          setCancel={setCancel}
          setTrigger={setTrigger}
          cancel={cancel}
        />
        <PostCreateFormWrapper cancel={cancel}>
          <PostCreateForm setTrigger={setTrigger} replyId={replyId} />
        </PostCreateFormWrapper>
      </div>
    </div>
  );
}

function PostModalTrigger({
  setTrigger,
  type,
  count = 0,
}: {
  setTrigger: Dispatch<SetStateAction<boolean>>;
  type: "comment" | "post";
  count?: number;
}) {
  const { data: session } = useSession();

  return (
    <Button
      variant={null}
      size={null}
      className={cn(
        "hover:bg-primary-foreground rounded-full py-2 px-3 scale-1",
        type == "post" && "h-full py-3 px-6 rounded-md",
        type == "comment" && "hover:scale-90"
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (session && session?.user!) {
          setTrigger(true);
        }
      }}
    >
      {type == "post" ? (
        <SquarePlus className="h-6 w-6 md:h-7 md:w-7 text-zinc-600" />
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="gap-1 flex items-center">
                <MessageCircle className="h-5 w-5 text-primary" />

                <span className="text-xs">{count}</span>
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>Comment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Button>
  );
}

function PostCancelModal({
  setCancel,
  setTrigger,
  cancel,
}: {
  setCancel: Dispatch<SetStateAction<boolean>>;
  setTrigger: Dispatch<SetStateAction<boolean>>;
  cancel: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "p-2 select-none rounded-xl absolute w-64 bg-background border scale-0",
          cancel && "scale-100"
        )}
      >
        <div className="rounded-xl">
          <Button
            variant={null}
            size={"lg"}
            className="flex justify-center hover:bg-primary-foreground items-center w-full focus-visible:ring-0"
            onClick={(e) => {
              e.stopPropagation();
              setCancel(false);
              setTrigger(false);
            }}
          >
            Save as draft
          </Button>
        </div>
        <div className="rounded-xl">
          <Button
            variant={null}
            size={"lg"}
            className="flex justify-center hover:bg-primary-foreground items-center w-full focus-visible:ring-0 text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setCancel(false);
              setTrigger(false);
            }}
          >
            Discard
          </Button>
        </div>
      </div>
    </>
  );
}

function PostCreateFormWrapper({
  children,
  cancel,
}: {
  children: ReactNode;
  cancel: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background w-[36rem] min-h-[12rem] max-h-96 overflow-y-auto scale-0 transition-all ease-in",
        !cancel && "scale-1"
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
