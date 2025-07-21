import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(5),
  dateOfBirth: z.string(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(3),
  country: z.string().min(2),
  isAdmin: z.boolean().default(false),
  status: z.enum(["pending", "approved", "rejected", "suspended"]).default("pending"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserWithoutId = Omit<User, "id">;

// Credit Card Details schema
export const creditCardSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  cardNumber: z.string().min(16).max(19),
  cardholderName: z.string().min(3).max(50),
  expiryMonth: z.string().min(1),
  expiryYear: z.string().min(1),
  cvv: z.string().min(3).max(4),
  creditLimit: z.string().min(1),
  billingAddress: z.string().min(5),
  billingCity: z.string().min(2),
  billingState: z.string().min(2),
  billingZip: z.string().min(3),
  billingCountry: z.string().min(2),
  isVerified: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CreditCardDetails = z.infer<typeof creditCardSchema>;
export type InsertCreditCardDetails = Omit<CreditCardDetails, "id">;

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: number;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: number;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    isAdmin: boolean;
  };
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface AdminLoginAttempt {
  id: string;
  username: string;
  ip: string;
  timestamp: string;
  approved: boolean | null;
}

export interface SystemSettings {
  id: string;
  notificationSettings: {
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    enablePushNotifications: boolean;
  };
  systemAnnouncement: {
    enabled: boolean;
    message: string;
    type: "info" | "warning" | "error";
    expiresAt: string;
  };
  securitySettings: {
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
    requireTwoFactor: boolean;
  };
  updatedAt: string;
  updatedBy: number;
}

// Validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export const insertMessageSchema = z.object({
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string().min(1, "Message content is required"),
});

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const systemSettingsSchema = z.object({
  notificationSettings: z.object({
    enableEmailNotifications: z.boolean(),
    enableSmsNotifications: z.boolean(),
    enablePushNotifications: z.boolean(),
  }),
  systemAnnouncement: z.object({
    enabled: z.boolean(),
    message: z.string(),
    type: z.enum(["info", "warning", "error"]),
    expiresAt: z.string(),
  }),
  securitySettings: z.object({
    maxLoginAttempts: z.number().min(1).max(10),
    sessionTimeoutMinutes: z.number().min(5).max(1440),
    requireTwoFactor: z.boolean(),
  }),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type SystemSettingsData = z.infer<typeof systemSettingsSchema>;
