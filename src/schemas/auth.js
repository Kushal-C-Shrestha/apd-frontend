import { z } from 'zod';

export const loginSchema = z.object({
    identifier: z.string()
        .min(1, 'Email or phone number is required')
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
});

export const registerSchema = z.object({
    name: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .trim(),
    email: z.string()
        .min(1, 'Email address is required')
        .email('Invalid email address')
        .trim(),
    phone: z.string()
        .min(1, 'Phone number is required')
        .regex(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number format')
        .trim(),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .trim(),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
        .min(1, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const forgotPasswordEmailSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required').trim()
});

export const verifyOtpSchema = z.object({
    otpCode: z.string().min(1, 'OTP is required').trim()
});

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const addStaffSchema = z.object({
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .trim(),
    email: z.string()
        .min(1, 'Email address is required')
        .email('Invalid email address')
        .trim(),
    phone: z.string()
        .min(1, 'Phone number is required')
        .regex(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number format')
        .trim(),
    address: z.string()
        .max(200, 'Address cannot exceed 200 characters')
        .trim()
        .optional()
        .or(z.literal('')),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
});

export const editStaffSchema = z.object({
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .trim(),
    email: z.string()
        .min(1, 'Email address is required')
        .email('Invalid email address')
        .trim(),
    phone: z.string()
        .min(1, 'Phone number is required')
        .regex(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number format')
        .trim(),
    address: z.string()
        .max(200, 'Address cannot exceed 200 characters')
        .trim()
        .optional()
        .or(z.literal(''))
});

export const vendorSchema = z.object({
    name: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .trim(),
    contactPerson: z.string()
        .min(2, 'Contact person must be at least 2 characters')
        .trim(),
    email: z.string()
        .min(1, 'Email address is required')
        .email('Invalid email address')
        .trim(),
    phone: z.string()
        .min(1, 'Phone number is required')
        .regex(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number format')
        .trim(),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .trim()
});