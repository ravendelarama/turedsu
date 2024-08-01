import { View } from "@prisma/client";

export type PostUser = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    username: string | null;
    bio: string | null;
    link?: string | null;
    verified: boolean;
    _count: {
      followedBy: number;
    };
  };
  
  export type PostItemType = {
    id: string;
    caption: string;
    parentId: string | null;
    repostId: string | null;
    quoteId: string | null;
    userId: string;
    user: PostUser;
    createdAt: Date;
    medias: {
      id: string;
      key: string;
      name: string;
      source: string;
      type: string;
      aspectRatio: string;
      postId: string;
    }[];
    _count: {
      likes: number;
      replies: number;
      reposts: number;
        quotedBy: number;
        views: number;
    };
  };