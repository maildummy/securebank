import { users, messages, sessions, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getConversationsForUser(userId: number): Promise<any[]>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;
  
  // Session operations
  createSession(sessionId: string, userId: number, expiresAt: Date): Promise<void>;
  getSession(sessionId: string): Promise<{ userId: number } | undefined>;
  deleteSession(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      or(eq(users.email, identifier), eq(users.username, identifier))
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getConversationsForUser(userId: number): Promise<any[]> {
    // Get latest message for each conversation
    const conversations = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Group by conversation partner
    const grouped = new Map();
    for (const msg of conversations) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!grouped.has(partnerId)) {
        grouped.set(partnerId, msg);
      }
    }

    return Array.from(grouped.values());
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId)));
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db
      .select()
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    return result.length;
  }

  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<void> {
    await db.insert(sessions).values({ id: sessionId, userId, expiresAt });
  }

  async getSession(sessionId: string): Promise<{ userId: number } | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));
    
    if (!session || session.expiresAt < new Date()) {
      return undefined;
    }
    
    return { userId: session.userId };
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}

export const storage = new DatabaseStorage();
