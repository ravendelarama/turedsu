"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema, signUpSchema } from "@/lib/zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { login, register } from "@/actions/auth";
import { CircleUserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export function SignupForm() {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      name: "",
    },
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {
    const imagePrev = () => {
      if (form.getValues().avatar) {
        setPreview(window.URL.createObjectURL(form.getValues()?.avatar!));
      }
    };

    imagePrev();

    return () => {
      window.URL.revokeObjectURL(preview);
    };
  }, [form.getValues().avatar]);

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    console.log(values);
    const formData = new FormData();
    if (values.avatar) {
      formData.append("avatar", values.avatar, values.avatar?.name);
    }
    formData.append("name", values.name);
    formData.append("username", values.username!);
    formData.append("email", values.email);
    formData.append("password", values.password);
    const res = await register(formData);

    // @ts-ignore
    if (res?.message!) {
      // @ts-ignore
      toast.error(res?.message!);
    }

    toast.success("Created");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full"
      >
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="w-full flex justify-center items-center">
              <FormLabel htmlFor="avatar">
                <Avatar className="h-24 w-24 border">
                  <AvatarImage src={preview!} />
                  <AvatarFallback>
                    {form.getValues().name &&
                      `${form.getValues().name.charAt(0)}${form
                        .getValues()
                        .name.charAt(1)}`}
                  </AvatarFallback>
                </Avatar>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  id="avatar"
                  name={field.name}
                  disabled={field.disabled}
                  onChange={(e) => {
                    const files = Array.from(e?.target?.files!);
                    form.setValue("avatar", files[0] as File);
                  }}
                  onBlur={field.onBlur}
                  className="hidden"
                />
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
              <FormControl>
                <Input
                  placeholder="Name"
                  {...field}
                  className="h-14 rounded-xl bg-primary-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Username"
                  {...field}
                  className="h-14 rounded-xl bg-primary-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Email"
                  {...field}
                  className="h-14 rounded-xl bg-primary-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Password"
                  {...field}
                  className="h-14 rounded-xl bg-primary-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size={null}
          className="py-4 w-full rounded-xl font-semibold"
          disabled={
            form.getValues().email! == "" || form.getValues().password! == ""
          }
        >
          Register
        </Button>
      </form>
    </Form>
  );
}
