import { SignInForm } from "@/components/pages/login";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
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
      </div>
    </div>
  );
}
