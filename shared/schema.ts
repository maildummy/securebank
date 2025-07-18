import { z } from "zod";

// Local storage data types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

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
}

// Validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
