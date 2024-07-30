import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth"
import google from "next-auth/providers/google"
import { db } from "./db";
import github from "next-auth/providers/github";
import credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { signInSchema } from "./zod";
import { z } from "zod";

export const authConfig = {
    adapter: PrismaAdapter(db),
    pages: {
        signIn: '/signin',
        error: '/auth/error'
    },
    providers: [
        // google,
        // github,
        credentials({
            credentials: {
                email: {},
                id: {},
                image: {},
                name: {}
            },
            authorize: async (credentials) => {
                const { id, email, name, image } = credentials;

                const user = {
                    id: id as string,
                    email: email as string,
                    name: name as string | undefined,
                    image: image as string | undefined
                };
            
                return user
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7,
        updateAge: 60 * 60,
    },
    debug: process.env.NODE_ENV == "development"
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);