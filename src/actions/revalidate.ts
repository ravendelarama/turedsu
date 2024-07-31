'use server'

import { revalidatePath } from "next/cache"


export async function reload(path: string) {
    if (path) {
        revalidatePath(path);
        return;
    }

    revalidatePath('/');
}