"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Mention, MentionsInput } from "react-mentions";
import { Images, SquarePlus, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  getTagSuggestions,
  getUserSuggestions,
  postFormSchema,
} from "./create-post";
import { createPost } from "@/actions/post";

export function CreatePostDrawer() {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={null}
          size={null}
          className="hover:bg-primary-foreground py-2 px-4"
        >
          <SquarePlus className="h-6 w-6 md:h-7 md:w-7 text-zinc-600" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full md:hidden">
        <ProfileForm className="p-4 overflow-y-auto" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  replyId,
}: {
  className?: string;
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

  async function onSubmit(values: z.infer<typeof postFormSchema>) {
    const formData = new FormData();

    console.log(values);

    if (replyId) {
      formData.append("replyId", replyId);
    }

    values.threads.map((item, index) => {
      formData.append(`threads.captions`, item.caption!);
      item.medias.map((m) => {
        console.log(m);
        formData.append(`threads.${index}.medias`, m, m.name);
      });
    });

    console.log(formData);

    // await createPost(formData);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid items-start gap-4", className)}
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
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                  @{suggestion.display}
                                </span>
                                <span className="text-sm text-zinc-500 font-normal">
                                  {suggestion.id} followers
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Mention
                        trigger={"#"}
                        data={getTagSuggestions}
                        className="bg-blue-900 overflow-y-auto z-40"
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
                                  #{entry.display}
                                </span>
                                <span className="text-sm text-zinc-500 font-normal">
                                  {entry.id} posts
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
                          const prev = form.getValues(
                            `threads.${index}.medias`
                          );
                          const added = [...prev, ...files];
                          form.setValue(
                            `threads.${index}.medias`,
                            // @ts-ignore
                            added as File[]
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
