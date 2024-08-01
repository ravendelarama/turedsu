"use client";

import { Button } from "@/components/ui/button";
import { PostUser } from "@/lib/thread-types";
import { cn } from "@/lib/utils";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/actions/user";
import { toast } from "sonner";

const profileFormSchema = z.object({
  avatar: z.custom<File>().optional(),
  name: z.string().max(32).optional(),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(200).optional(),
  link: z.string().optional(),
});

export function ProfileForm({
  setVisible,
  user,
}: {
  setVisible: Dispatch<SetStateAction<boolean>>;
  user: PostUser;
}) {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      avatar: undefined,
      name: user?.name ?? undefined,
      username: user.username ?? undefined,
      bio: user?.bio ?? undefined,
      link: user?.link ?? undefined,
    },
  });

  // Edit profile form (desktop and mobile)
  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    console.log(values);
    const formData = new FormData();
    if (values.avatar) {
      formData.append("avatar", values.avatar as Blob, values.avatar.name);
    }

    if (values.name) {
      formData.append("name", values.name);
    }

    if (values.username) {
      formData.append("username", values.username);
    }

    if (values.bio) {
      formData.append("bio", values.bio);
    }

    if (values.link) {
      formData.append("link", values.link);
    }

    const res = await updateUserProfile(formData);

    toast.info(res.message);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 p-4">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="avatar">
                  <Avatar className="h-24 w-24 border cursor-pointer">
                    <AvatarImage src={user?.image!} />
                    <AvatarFallback>
                      {form.getValues().name?.charAt(0).toUpperCase()}
                      {form.getValues().name?.charAt(1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    placeholder="Write bio"
                    onBlur={field.onBlur}
                    disabled={field.disabled}
                    ref={field.ref}
                    name={field.name}
                    onChange={(e) => {
                      const file = e.target.files!;
                      form.setValue("avatar", file[0]);
                    }}
                    className="hidden"
                    id={"avatar"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Input placeholder="Write bio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Done
        </Button>
      </form>
    </Form>
  );
}

export function ProfileFormCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="p-4 rounded-xl bg-background border w-[36rem] max-h-[28rem] min-h-[12rem]"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function ProfileFormProvider({
  children,
  visible,
  setVisible,
}: {
  children: ReactNode;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={cn(
        "bg-background/50 w-full h-screen z-20 fixed inset-0 flex flex-col justify-center items-center",
        !visible && "hidden"
      )}
      onClick={(e) => {
        e.stopPropagation();
        setVisible(!visible);
      }}
    >
      {children}
    </div>
  );
}

export function ProfileFormTrigger({
  user,
  setVisible,
}: {
  setVisible: Dispatch<SetStateAction<boolean>>;
  user: PostUser;
}) {
  return (
    <Button
      variant={"outline"}
      className="w-full my-2"
      onClick={(e) => {
        e.stopPropagation();
        setVisible((prev) => !prev);
      }}
    >
      Edit Profile
    </Button>
  );
}

export function ProfileFormModal({ user }: { user: PostUser }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <ProfileFormTrigger user={user} setVisible={setVisible} />
      <ProfileFormProvider setVisible={setVisible} visible={visible}>
        <ProfileFormCard>
          <ProfileForm user={user} setVisible={setVisible} />
        </ProfileFormCard>
      </ProfileFormProvider>
    </>
  );
}
