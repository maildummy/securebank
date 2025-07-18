import { type User, type InsertUser, type Message, type InsertMessage, type Session } from "@shared/schema";
import path from "path";
import fs from "fs/promises";

const DATA_DIR = path.join(process.cwd(), "data");

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

class LocalFileStorage implements IStorage {
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private async readJSONFile<T>(filename: string, defaultValue: T): Promise<T> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private async writeJSONFile<T>(filename: string, data: T): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    return users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    return users.find(user => user.email === email);
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    return users.find(user => user.email === identifier || user.username === identifier);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    const newUser: User = {
      ...insertUser,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      status: "pending",
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    await this.writeJSONFile("users.json", users);
    return newUser;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return undefined;
    
    users[userIndex] = {
      ...users[userIndex],
      status: status as any,
      updatedAt: new Date().toISOString(),
    };
    
    await this.writeJSONFile("users.json", users);
    return users[userIndex];
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    const newMessage: Message = {
      ...message,
      id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    await this.writeJSONFile("messages.json", messages);
    return newMessage;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    return messages
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConversationsForUser(userId: number): Promise<any[]> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    const userMessages = messages.filter(msg => msg.senderId === userId || msg.receiverId === userId);
    
    const grouped = new Map();
    for (const msg of userMessages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!grouped.has(partnerId) || new Date(msg.createdAt) > new Date(grouped.get(partnerId).createdAt)) {
        grouped.set(partnerId, msg);
      }
    }

    return Array.from(grouped.values());
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    const updatedMessages = messages.map(msg => {
      if (msg.senderId === senderId && msg.receiverId === receiverId) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
    
    await this.writeJSONFile("messages.json", updatedMessages);
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    return messages.filter(msg => msg.receiverId === userId && !msg.isRead).length;
  }

  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<void> {
    const sessions = await this.readJSONFile<Session[]>("sessions.json", []);
    const newSession: Session = {
      id: sessionId,
      userId,
      expiresAt: expiresAt.toISOString(),
    };
    
    sessions.push(newSession);
    await this.writeJSONFile("sessions.json", sessions);
  }

  async getSession(sessionId: string): Promise<{ userId: number } | undefined> {
    const sessions = await this.readJSONFile<Session[]>("sessions.json", []);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      return undefined;
    }
    
    return { userId: session.userId };
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessions = await this.readJSONFile<Session[]>("sessions.json", []);
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    await this.writeJSONFile("sessions.json", filteredSessions);
  }
}

export const storage = new LocalFileStorage();
