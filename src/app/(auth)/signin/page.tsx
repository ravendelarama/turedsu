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
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="w-[24rem] flex flex-col justify-start items-center gap-2">
        <p>Log in with your email and password</p>
        <SignInForm />
      </div>
    </div>
  );
}
