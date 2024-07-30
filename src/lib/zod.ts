import { z, object, string } from "zod"
 
export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})


export const signUpSchema = object({
    avatar: z.custom<File>().optional(),
    name: string(),
    username: string().optional(),
    email: string().email(),
    password: string().min(8).max(32)
});