import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth"
import google from "next-auth/providers/google"
import { db } from "./db";
import github from "next-auth/providers/github";
import credentials from "next-auth/providers/credentials";

export const authConfig = {
    adapter: PrismaAdapter(db),
    pages: {
        signIn: '/signin',
        error: '/auth/error'
    },
    providers: [
        google({
            allowDangerousEmailAccountLinking: true,
            profile: (profile) => {
                return {
                    emailVerified: profile.emailVerified,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    username: `${profile.name}`.split(' ').join('').toLowerCase()
                }
            }
        }),
        github({
            allowDangerousEmailAccountLinking: true,
            profile: (profile) => {
                return {
                    email: profile.email,
                    name: profile.name,
                    username: profile.login ?? profile.name?.split(' ').join('').toLowerCase(),
                    image: profile.avatar_url,
                    bio: profile.bio,
                }
            }
        }),
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
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id!;
            }

            return token;
        },
        session: async ({ token, session }) => {
            if (token) {
                session.user.id = token.id;
            }

            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7,
        updateAge: 60 * 60,
    },
    debug: process.env.NODE_ENV == "development"
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);