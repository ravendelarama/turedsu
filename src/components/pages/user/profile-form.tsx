"use client";

import { Button } from "@/components/ui/button";
import { PostUser } from "@/lib/thread-types";
import { cn } from "@/lib/utils";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";

export function ProfileForm({
  setVisible,
  user,
}: {
  setVisible: Dispatch<SetStateAction<boolean>>;
  user: PostUser;
}) {
  return (
    <form>
      <Button
        variant={"outline"}
        className=""
        type="submit"
        onClick={(e) => {
          e.stopPropagation();
          //   setVisible((prev) => prev);
        }}
        disabled
      >
        Save
      </Button>
    </form>
  );
}

export function ProfileFormCard({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 rounded-lg bg-background border w-[36rem] max-h-96 min-h-[12rem]">
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
