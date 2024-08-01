'use server';

import { postFormSchema } from "@/components/pages/post/create-post";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fileUpload, utapi } from "@/lib/uploadthing";
import { tagExtractor, tagFilter, tagParser } from "@/lib/utils";
import { Post } from "@prisma/client";
import { revalidatePath } from "next/cache";


export async function createPost(form: FormData) {
    const session = await auth();

    if (!session || !session?.user) {
        return {
            success: false,
            message: "Unauthorized"
        }
    }

    const newThreads: Post[] = [];
    const replyId = form.get('replyId');

    for (var i = 0; i < form.getAll('threads.captions').length; i++) {

        const newPost = await db.post.create({
            data: {
                userId: session?.user?.id!,
                caption: form.getAll('threads.captions')[i] as string ?? "",
                parentId: i > 0 ? newThreads[i - 1].id: i == 0 && replyId ? replyId as string: null
            }
        });

        const tags = tagExtractor(newPost.caption);

        if (tags && tags.length > 0) {
            await db.post.update({
                where: {
                    id: newPost.id
                },
                data: {
                    caption: tagParser(newPost.caption),
                    tags: {
                        create: [
                            ...tags
                        ]
                    }
                }
            });
        }

        const filteredtags = tagFilter(newPost.caption);
        if (filteredtags) {
            filteredtags?.map(async (item) => {
                if (item) {
                    const tagId = await db.tag.findFirst({
                        where: {
                            name: item
                        },
                        select: {
                            id: true
                        }
                    });

                    await db.tag.update({
                        where: {
                            id: tagId?.id!
                        },
                        data: {
                            posts: {
                                connect: {
                                    id: newPost?.id
                                }
                            }
                        }
                    })
                }
            })
        }

        newThreads.push(newPost);
        
        // if there are media files
        if (form.getAll(`threads.${i}.medias`).length > 0) {
            const res = await fileUpload(form.getAll(`threads.${i}.medias`) as File[]);
            console.log(res);
            if (res) {
                // @ts-ignore
                const attachment = res.map((item) => {
                    return {
                        postId: newPost.id!,
                        source: item.data?.url!,
                        type: item.data?.type!,
                        name: item.data?.name!,
                        key: item.data?.key!
                    }
                });
            
                if (attachment.length > 0) {
                    await db.media.createMany({
                        data: [
                            ...attachment,
                        ]
                    });
                }
            }
        }

        
        
    }

    // console.log(newThreads);

    revalidatePath('/');
    return {
        success: true,
        message: "Uploading..."
    }
}

export async function getPosts({ pageParams }: { pageParams: number; }) {
    const posts = await db.post.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        where: {
            parentId: null
        },
        skip: pageParams,
        take: 10,
        include: {
            medias: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    image: true,
                    email: true,
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
        }
    });

    return {
        data: posts
    }
}


export async function deletePost(id: string) {
    const session = await auth();


    if (!session || !session?.user) {
        return {
            success: false,
            message: "Unauthorized"
        }
    }

    const children = await db.post.findMany({
        where: {
            parentId: id
        },
        include: {
            medias: true
        }
    });

    // Disconnect relations of tags from posts
    

    // @ts-ignore
    let childKeys = [];
    
    if (children.length > 0) {
        try {
            await db.$transaction(async (tx) => {
                children.map(async (child) => {
                    await tx?.post.update({
                        where: {
                            id: child.id
                        },
                        data: {
                            tags: {
                                set: []
                            }
                        }
                    });
                });
            });
        } catch {
            return {
                success: false,
                message: "Server Error"
            }
        }

        childKeys = children.map(async (item) => {
            return item.medias.map(sub => sub.key);
        });


        await db.post.deleteMany({
            where: {
                parentId: id
            }
        });
    }

    await db?.post.update({
        where: {
            id
        },
        data: {
            tags: {
                set: []
            }
        }
    });
    
    const del = await db.post.delete({
        where: {
            id
        },
        include: {
            medias: true
        }
    });

    const fileKeys = del.medias.map((item) => {
        return item.key;
    });

    // @ts-ignore
    await utapi.deleteFiles([...childKeys.flat(), ...fileKeys]);

    
    revalidatePath('/');
    return {
        success: true,
        message: "Deleted"
    }
}


export async function getPostCounts(id?: string) {
    if (!id) {
        return null;
    }
    const counts = await db.post.findFirst({
        where: {
            id
        },
        select: {
            _count: {
                select: {
                    likes: true,
                    replies: true,
                    reposts: true,
                    quotedBy: true,
                    views: true,
                }
            }
        }
    });

    return counts;
}


export async function getPostByID(id: string) {
    const post = await db.post.findFirst({
        where: {
            id
        },
        include: {
            medias: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    email: true,
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
        }
    });

    return post;
}

export async function getPostsByTag(tag?: string | null) {
    console.log(tag)
    const data = await db.tag.findFirst({
        where: {
            name: tag ?? ""
        }
    });

    console.log(data?.postIDs);

    if (!data) {
        return [];
    }

    const results = await db.post.findMany({
        where: {
            tagIDs: {
                has: data?.id
            }
        },
        orderBy: [
            {
                likes: {
                    _count: 'desc'
                }
            },
            {
                views: {
                    _count: 'desc'
                }
            }
        ],
        include: {
            medias: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    email: true,
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
        }
    });

    return results;
} 

export async function likePost(id: string) {
    const session = await auth();

    if (!session || !session?.user) {
        return {
            success: false,
            message: "Unauthorized"
        }
    }

    const liked = await db.like.findFirst({
        where: {
            userId: session?.user?.id,
            postId: id
        },
        include: {
            user: true
        }
    });

    if (!liked) {
        await db.post.update({
            where: {
                id
            },
            data: {
                likes: {
                    create: {
                        userId: session?.user?.id!
                    }
                }
            }
        });
    } else {
        await db.like.delete({
            where: {
                id: liked.id
            }
        });
    }

    revalidatePath('/');
    revalidatePath(`/@${liked?.user.username}/post/${liked?.postId}`);
    return {
        success: true,
        message: "Created"
    }
}

export async function isLikedPost(id: string) {
    const session = await auth();

    if (!session || !session?.user) {
        return false;
    }

    const res = await db.like.count({
        where: {
            userId: session?.user.id,
            postId: id
        }
    })

    return res > 0 ? true: false;
}


export async function uploadMediaFiles(media: File) {
    const result = await fileUpload([media]);

    if (!result) {
        return null;
    }

    return result;
}


export async function getReplies(id: string) {
    const replies = await db.post.findMany({
        where: {
            parentId: id
        },
        include: {
            medias: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    email: true,
                    image: true,
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
        }
    });


    return replies;
}

export async function getUserThreadPosts(id: string) {
    const threads = await db.post.findMany({
        where: {
            userId: id,
            parentId: null
        },
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
        orderBy: {
            createdAt: 'desc'
        }
    });

    return threads;
}


export async function getUserThreadReplies(id: string) {
    if (!id) {  
        return null;
    }

    const threads = await db.post.findMany({
        where: {
            userId: id,
            parentId: {
                not: null
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            medias: true,
            parent: {
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
            },
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
    });

    return threads;
}

export async function addView(postId: string, userId: string) {
    const seen = await db.view.count({
        where: {
            postId,
            userId
        }
    });

    if (seen == 0) {
        await db.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    create: {
                        userId: userId
                    }
                }
            }
        });
    }
}