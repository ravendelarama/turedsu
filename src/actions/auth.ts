'use server'

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { utapi } from "@/lib/uploadthing";
import { signInSchema, signUpSchema } from "@/lib/zod"
import bcryptjs from 'bcryptjs';
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";


export async function register(form: FormData) {
    const { data, success } = await signUpSchema.spa({
        avatar: form.get('avatar'),
        email: form.get('email'),
        name: form.get('name'),
        username: form.get('username'),
        password: form.get('password')
    });

    console.log(data);

    if (!success) {
        return {
            success: false,
            message: "Invalid Credentials"
        }
    }
    
    const existed = await db.user.findFirst({
        where: {
            email: data.email
        }
    });

    if (existed) {
        return {
            success: false,
            message: "Invalid email"
        }
    }

    const hash = await bcryptjs.hash(data.password, 10);

    let image: string = ''
    if (data.avatar) {
        const result = await utapi.uploadFiles([data.avatar]);
        image = result[0].data?.url!;
    }

    await db.user.create({
        data: {
            image,
            username: data.username,
            email: data.email,
            name: data.name,
            password: hash
        }
    });

    return {
        success: true,
        message: "Created account"
    };
}

export async function login(provider: "credentials" | "google" | "github", values: { email: string; password: string; }) {
    if (provider == "credentials") {
        const { data, success, error } = await signInSchema.spa(values);

        if (!success) {
            return {
                success,
                message: error.message
            }
        }

        const user = await db.user.findUnique({
            where: {
                email: data?.email!
            }
        });

        if (!user) {
            return {
                success: false,
                message: "Invalid email"
            }
        }

        if (!user?.password) {
            return {
                success: false,
                message: "Invalid authentication method"
            }
        }

        const hash = await bcryptjs.compare(data.password, user?.password!);

        if (!hash) {
            return {
                success: false,
                message: "Invalid password"
            }
        }

        await signIn('credentials', {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
        });

        revalidatePath('/');

        return {
            success: true,
            message: "Signed in"
        }
    }

    try {
        await signIn(provider);
        revalidatePath('/');
        return {
            success: true,
            message: "Signed in"
        }
    } catch {
        return {
            success: false,
            message: "Invalid Credentials"
        }
    }
}

export async function logout() {
    await signOut();
    revalidatePath('/');
}