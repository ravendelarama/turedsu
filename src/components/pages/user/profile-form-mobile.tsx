"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileFormDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline"></Button>
      </DrawerTrigger>
      <DrawerContent className="h-full md:hidden">
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  return (
    <form className={cn("grid items-start gap-4", className)}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input name="name" id="name" />
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input name="username" id="username" />
      </div>
      <div>
        <Label htmlFor="name">Bio</Label>
        <Input name="bio" id="bio" />
      </div>
      <Button type="submit">Done</Button>
    </form>
  );
}
