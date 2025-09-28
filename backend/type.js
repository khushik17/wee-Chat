const zod = require('zod');
const createUserSchema = zod.object({
    name: zod.string().min(4,  "Important to fill this field"),
    email: zod.string().email("Invalid email format"),
    phone:zod.string()
  .regex(/^\d{10}$/, "Number must be exactly 10 digits"),
    password: zod.string().min(6)
    .regex(/[a-z]/, "should contain at least one lowercase letter")
    .regex(/[A-Z]/, "should contain at least one uppercase letter")
    .regex(/[0-9]/ , " should have at least a number ")
    .regex(/[^A-Za-z0-9]/, "should have at least one special character ")
    .max(30),
    username: zod.string().min(4)
    .regex(/[a-z]/, "should contain at least one lowercase letter")
     .regex(/[0-9]/ , " should have at least a number ")
});
const updateUserSchema = zod.object({
    name: zod.string().optional(),
    email: zod.string().optional(),
    phone: zod.number().int().positive().optional(),
});
    
    const loginSchema = zod.object({
     password: zod.string().min(6)
    .regex(/[a-z]/, "should contain at least one lowercase letter")
    .regex(/[A-Z]/, "should contain at least one uppercase letter")
    .regex(/[0-9]/ , " should have at least a number ")
    .regex(/[^A-Za-z0-9]/, "should have at least one special character ")
    .max(30),
    username: zod.string().min(4)
    .regex(/[a-z]/, "should contain at least one lowercase letter")
     .regex(/[0-9]/ , " should have at least a number ")
    })
    const sendSchema = zod.object({
         receiverId: zod.string().min(1),
        memeId: zod.string().min(1),
    })

module.exports = {
    createUserSchema,
    updateUserSchema,
    loginSchema,
    sendSchema
   
}