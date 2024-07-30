'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";


export async function createRepost({ postId }: { postId: string; }) {
    const session = await auth();

    if (!session || !session?.user) {
        return {
            success: false,
            message: "Unauthorized"
        }
    }

    const user = await db.user.findUnique({
        where: {
            email: session?.user.email!
        }
    });

    if (!user) {
        return {
            success: false,
            message: "Unauthorized"
        }
    }
}