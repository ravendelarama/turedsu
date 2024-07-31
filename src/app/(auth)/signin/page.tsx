import { SignInForm } from "@/components/pages/login";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth, signIn } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    return redirect("/");
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-[url('/threads-auth-upper-design.webp')] object-cover bg-origin-border bg-top bg-no-repeat bg-cover">
      <div className="w-[24rem] flex flex-col justify-start items-center gap-2">
        <p className="text-lg font-semibold font-sans text-zinc-100">
          Log in with your email and password
        </p>
        <SignInForm />
        <div className="w-full my-5 flex justify-between items-center">
          <Separator orientation="horizontal" className="w-[45%]" />
          <p className="text-zinc-600">or</p>
          <Separator orientation="horizontal" className="w-[45%]" />
        </div>
        <div className="flex items-center gap-4 w-full">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
            className="w-full"
          >
            <Button
              type="submit"
              variant={"outline"}
              size={null}
              className="w-full border rounded-lg py-2 flex justify-center items-center text-sm font-semibold font-sans"
            >
              <FcGoogle className="h-7 w-7" />
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
            className="w-full"
          >
            <Button
              type="submit"
              variant={"outline"}
              size={null}
              className="w-full border rounded-lg py-2 flex justify-center items-center text-sm font-semibold font-sans"
            >
              <FaGithub className="h-7 w-7" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
