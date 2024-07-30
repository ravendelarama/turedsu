'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";



export async function getPostUserByID(id: string) {
    const user = await db.user.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            verified: true,
            bio: true,
            image: true,
            _count: {
                select: {
                    followedBy: true,
                }
            }
        }
    });

    return user!;
}


export async function getPostUserByUsername(username: string) {
    const user = await db.user.findFirst({
        where: {
            username
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            verified: true,
            bio: true,
            image: true,
            _count: {
                select: {
                    followedBy: true,
                }
            }
        }
    });

    return user!;
}



export async function getUserQuery(query: string) {
    const results = await db.user.findMany({
        where: {
            username: {
                startsWith: query
            }
        },
        skip: 0,
        take: 10
    });

    console.log(results);

    return results;
}

export async function followUser(id: string) {
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

    const following = await db.user.findFirst({
        where: {
            id,
            followedBy: {
                some: {
                    id: user.id
                }
            }
        }
    });

    if (!following) {
        await db.user.update({
            where: {
                id
            },
            data: {
                followedBy: {
                    connect: {
                        id: user.id
                    }
                }
            }
        });

    }

    await db.user.update({
        where: {
            id
        },
        data: {
            followedBy: {
                disconnect: {
                    id: user.id
                }
            }
        }
    });

    revalidatePath('/');

    return {
        success: true,
        message: "Done"
    }
}