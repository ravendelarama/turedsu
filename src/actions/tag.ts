'use server'

import { db } from "@/lib/db"

export async function getTagQuery(query: string) {
    const res =  await db.tag.findMany({
        where: {
            name: {
                startsWith: query
            }
        },
        take: 8,
        skip: 0
    });

    return res;
}