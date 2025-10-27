import { z } from 'zod';

// ✅ FIXED: Added profilePicture field
export const updateUserSchema = z.object({
    username: z.string().optional(),
    bio: z.string().optional(),
    email: z.string().email().optional(),
    profilePicture: z.string().optional(), // ✅ ADDED THIS LINE
});

export const sendSchema = z.object({
    receiverId: z.string().min(1),
    memeid: z.string().min(1),
});