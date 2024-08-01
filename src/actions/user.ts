'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { utapi } from "@/lib/uploadthing";
import { revalidatePath } from "next/cache";

export async function getPostUserByID(id: string) {
    if (!id) {
        return null;
    }
    
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
            link: true,
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
    if (!username) {
        return null;
    }

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
            link: true,
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

    const following = await db.user.findFirst({
        where: {
            id,
            followedBy: {
                some: {
                    id: session?.user?.id
                }
            }
        },
    });

    if (!following) {
        await db.user.update({
            where: {
                id
            },
            data: {
                followedBy: {
                    connect: {
                        id: session?.user?.id
                    }
                }
            }
        });

    } else {
        await db.user.update({
            where: {
                id
            },
            data: {
                followedBy: {
                    disconnect: {
                        id: session?.user?.id
                    }
                }
            }
        });
    }

    revalidatePath(`/@${following?.username}`);

    return {
        success: true,
        message: "Done"
    }
}

export async function isFollowed(id: string) {
    const session = await auth();

    if (!session) {
        return false;
    }

    const count = await db.user.count({
        where: {
            id,
            followedByIDs: {
                has: session?.user?.id!
            }
        }
    });

    return count > 0 ? true : false;
}


export async function updateUserProfile(form: FormData) {
    const session = await auth();

    const username = form.get("username");

    if (username) {
        const exist = await db.user.findFirst({
            where: {
                username: username as string ?? null
            }
        });

        if (exist && exist.id != session?.user?.id) {
            return {
                success: false,
                message: "Username already use"
            };
        }
    }

    const avatar = form.get("avatar");

    if (avatar) {
        const image = await utapi.uploadFiles([(avatar as File)]);

        const prevImage = await db.user.findFirst({
            where: {
                id: session?.user?.id
            },
        });

        if (prevImage && prevImage.image && prevImage.image.includes('utfs.io')) {
            await utapi.deleteFiles([prevImage.image.split('/')[4]]);
        }

        await db.user.update({
            where: {
                id: prevImage?.id
            },
            data: {
                image: image[0].data?.url
            }
        });
    }

    const result = await db.user.update({
        where: {
            id: session?.user?.id
        },
        data: {
            username: username as string,
            name: form.get("name") as string ?? null,
            bio: form.get("bio") as string ?? null,
            link: form.get("link") as string ?? null
        },
    });


    revalidatePath('/');
    revalidatePath(`/@${result.username}`)

    return {
        success: true,
        message: "Updated profile"
    }
}