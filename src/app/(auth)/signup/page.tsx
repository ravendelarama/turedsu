import { register } from "@/actions/auth";
import { SignupForm } from "@/components/pages/auth/register";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await auth();
  if (session) {
    return redirect("/");
  }

  return (
    <div className="flex justify-center items-center flex-col min-h-screen w-full bg-[url('/threads-auth-upper-design.webp')] object-cover bg-origin-border bg-top bg-no-repeat bg-cover">
      <div className="w-[24rem] flex flex-col justify-start items-center gap-2">
        <p>Join with us to share your story!</p>
        <SignupForm />
      </div>
    </div>
  );
}
