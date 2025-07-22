import { z } from "zod";
import { pgTable, text, boolean, timestamp, pgEnum, serial, integer } from "drizzle-orm/pg-core";

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6), // This will store the hashed password
  isAdmin: z.boolean().default(false),
  approved: z.boolean().default(false),
  suspended: z.boolean().default(false),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  createdAt: z.string(),
  // We'll securely handle plaintext password during auth without storing it
});

// Session schema
export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  expiresAt: z.string()
});

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  createdAt: z.string()
});

// Credit Card schema - we'll encrypt/tokenize sensitive data
export const creditCardSchema = z.object({
  id: z.string(),
  userId: z.string(),
  cardholderName: z.string(),
  // Store last 4 digits only for display purposes
  last4: z.string().length(4),
  // We'll tokenize these sensitive fields instead of storing directly
  cardToken: z.string(),
  expiryToken: z.string(),
  cvvToken: z.string(),
  approved: z.boolean().default(false),
  createdAt: z.string()
});

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  timestamp: z.string(),
  read: z.boolean().default(false)
});

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type CreditCard = z.infer<typeof creditCardSchema>;
export type Message = z.infer<typeof messageSchema>;

// Custom type for credit card form submission
export type CreditCardSubmission = {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
};

// Auth form data
export type AuthFormData = {
  username?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  country?: string;
};

// Login form data
export type LoginFormData = {
  email: string;
  password: string;
};

// For admins to see details (without sensitive data)
export type AdminViewUser = Omit<User, 'password'> & {
  creditCards?: Array<Omit<CreditCard, 'cardToken' | 'expiryToken' | 'cvvToken'>>;
};

// Password reset schema
export type PasswordReset = {
  email: string;
  phone?: string;
};

// Demo app settings - IMPORTANT FOR SECURITY SIGNAL
export const DEMO_MODE = true;
export const EDUCATIONAL_PURPOSE_ONLY = true;
export const NO_REAL_FINANCIAL_TRANSACTIONS = true;
