import { SignInForm } from "@/components/pages/login";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth, signIn } from "@/lib/auth";
import { FaInstagramSquare } from "react-icons/fa";
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
        <form
          action={async () => {
            "use server";
            await signIn("instagram");
          }}
        >
          <Button
            type="submit"
            variant={"outline"}
            size={"lg"}
            className="border rounded-lg py-2 flex justify-center items-center text-lg font-semibold font-sans"
          >
            <FaInstagramSquare className="h-7 w-7" />
            Continue with Instagram
          </Button>
        </form>
      </div>
    </div>
  );
}
