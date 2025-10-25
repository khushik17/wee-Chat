import { z } from 'zod';

export const updateUserSchema = z.object({
    username: z.string().optional(), // ✅ Backend use karta hai
    bio: z.string().optional(),      // ✅ Backend use karta hai
    email: z.string().email().optional(), // ✅ Email validation
});

export const sendSchema = z.object({
    receiverId: z.string().min(1),
    memeid: z.string().min(1),
});