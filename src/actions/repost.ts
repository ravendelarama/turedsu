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
}


export async function getUserThreadReposts(id: string) {
    if (!id) {
        return [];
    }

    const threads = await db.repost.findMany({
        where: {
            userId: id,
        },
        select: {
            createdAt: true,
            post: {
                include: {
                    medias: true,
                    user: {
                        select: {
                            username: true,
                            email: true,
                            name: true,
                            image: true,
                            link: true,
                            id: true,
                            verified: true,
                            bio: true,
                            _count: {
                                select: {
                                    followedBy: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            replies: true,
                            reposts: true,
                            quotedBy: true,
                            views: true,
                        }
                    }
                },
            }
        }
    });

    return threads;
}