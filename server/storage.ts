import fs from "fs/promises";
import path from "path";
import { 
  User, 
  Message, 
  Session, 
  CreditCardDetails, 
  InsertCreditCardDetails 
} from "@shared/schema";

const DATA_DIR = path.join(process.cwd(), "data");

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  updateUserPassword(id: number, password: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Message operations
  createMessage(message: Omit<Message, "id" | "isRead" | "createdAt">): Promise<Message>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getConversationsForUser(userId: number): Promise<any[]>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;
  deleteMessage(messageId: number): Promise<boolean>;
  
  // Session operations
  createSession(sessionId: string, userId: number, expiresAt: Date): Promise<void>;
  getSession(sessionId: string): Promise<{ userId: number } | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  deleteAllUserSessions(userId: number): Promise<void>;
  getAllSessions(): Promise<Session[]>;
  getActiveAdminSessions(): Promise<{ sessionId: string; userId: number }[]>;
  
  // Notification operations
  createNotification(notification: { id: string; userId: number; title: string; message: string; read: boolean; timestamp: string }): Promise<void>;
  
  // Credit Card operations
  createCreditCard(cardDetails: InsertCreditCardDetails): Promise<CreditCardDetails>;
  getCreditCardByUserId(userId: number): Promise<CreditCardDetails | undefined>;
  updateCreditCardVerification(userId: number, isVerified: boolean): Promise<CreditCardDetails | undefined>;
  getAllCreditCards(): Promise<CreditCardDetails[]>;
  
  // Activity Log operations
  getActivityLogsByUser(userId: number): Promise<any[]>;
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

  async createUser(insertUser: Omit<User, "id">): Promise<User> {
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
  
  async updateUserPassword(id: number, password: string): Promise<User | undefined> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return undefined;
    
    users[userIndex] = {
      ...users[userIndex],
      password,
      updatedAt: new Date().toISOString(),
    };
    
    await this.writeJSONFile("users.json", users);
    return users[userIndex];
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteUser(id: number): Promise<void> {
    const users = await this.readJSONFile<User[]>("users.json", []);
    const initialLength = users.length;
    const updatedUsers = users.filter(user => user.id !== id);
    if (updatedUsers.length < initialLength) {
      await this.writeJSONFile("users.json", updatedUsers);
    }
  }

  async createMessage(message: Omit<Message, "id" | "isRead" | "createdAt">): Promise<Message> {
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
    // Make sure the messages file exists
    await this.ensureDataDir();
    
    // Read messages from file, if file doesn't exist or is empty, create it with an empty array
    let messages = await this.readJSONFile<Message[]>("messages.json", []);
    
    // If messages array is empty, create a welcome message
    if (messages.length === 0 && userId2 === 1) { // userId2 is typically the admin in this context
      const welcomeMessage: Message = {
        id: 1,
        senderId: userId2,
        receiverId: userId1,
        content: "Welcome to SecureBank! Your account is pending approval. Please submit your credit card details to continue the verification process. If you have any questions, feel free to message us here.",
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      messages.push(welcomeMessage);
      await this.writeJSONFile("messages.json", messages);
    }
    
    // Filter and return messages between the two users
    return messages
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  // Get unread message count from a specific user
  async getUnreadMessageCountFromUser(receiverId: number, senderId: number): Promise<number> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    return messages.filter(msg => msg.receiverId === receiverId && msg.senderId === senderId && !msg.isRead).length;
  }

  // Get all unread message counts grouped by sender for admin dashboard
  async getUnreadMessageCountsByUser(adminId: number): Promise<{userId: number, count: number}[]> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    const users = await this.readJSONFile<User[]>("users.json", []);
    
    // Get all users except admin
    const nonAdminUsers = users.filter(user => user.id !== adminId);
    
    // Count unread messages from each user to admin
    return nonAdminUsers.map(user => {
      const count = messages.filter(msg => 
        msg.senderId === user.id && 
        msg.receiverId === adminId && 
        !msg.isRead
      ).length;
      
      return { userId: user.id, count };
    });
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    const messages = await this.readJSONFile<Message[]>("messages.json", []);
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      return false;
    }
    
    messages.splice(messageIndex, 1);
    await this.writeJSONFile("messages.json", messages);
    return true;
  }

  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<void> {
    const sessions = await this.readJSONFile<Session[]>("sessions.json", []);
    const newSession: Session = {
      id: sessionId,
      userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
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
  
  async deleteAllUserSessions(userId: number): Promise<void> {
    const sessions = await this.readJSONFile<Session[]>("sessions.json", []);
    const filteredSessions = sessions.filter(s => s.userId !== userId);
    await this.writeJSONFile("sessions.json", filteredSessions);
  }
  
  async getAllSessions(): Promise<Session[]> {
    return await this.readJSONFile<Session[]>("sessions.json", []);
  }

  async getActiveAdminSessions(): Promise<{ sessionId: string; userId: number }[]> {
    const sessions = await this.readJSONFile<Session[]>("sessions.json", []);
    const validSessions = sessions.filter(s => new Date(s.expiresAt) > new Date());
    
    // Get all admin users
    const users = await this.readJSONFile<User[]>("users.json", []);
    const adminUsers = users.filter(u => u.isAdmin && u.username === "Jude_Ogwu.U");
    const adminUserIds = adminUsers.map(u => u.id);
    
    // Filter sessions for admin users
    const adminSessions = validSessions
      .filter(s => adminUserIds.includes(s.userId))
      .map(s => ({ sessionId: s.id, userId: s.userId }));
    
    return adminSessions;
  }

  async createNotification(notification: { id: string; userId: number; title: string; message: string; read: boolean; timestamp: string }): Promise<void> {
    const notifications = await this.readJSONFile<any[]>("notifications.json", []);
    notifications.push(notification);
    await this.writeJSONFile("notifications.json", notifications);
  }

  async createCreditCard(cardDetails: InsertCreditCardDetails): Promise<CreditCardDetails> {
    const creditCards = await this.readJSONFile<CreditCardDetails[]>("creditCards.json", []);
    const newCard: CreditCardDetails = {
      ...cardDetails,
      id: creditCards.length > 0 ? Math.max(...creditCards.map(c => c.id)) + 1 : 1,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    creditCards.push(newCard);
    await this.writeJSONFile("creditCards.json", creditCards);
    return newCard;
  }

  async getCreditCardByUserId(userId: number): Promise<CreditCardDetails | undefined> {
    const creditCards = await this.readJSONFile<CreditCardDetails[]>("creditCards.json", []);
    return creditCards.find(card => card.userId === userId);
  }

  async updateCreditCardVerification(userId: number, isVerified: boolean): Promise<CreditCardDetails | undefined> {
    const creditCards = await this.readJSONFile<CreditCardDetails[]>("creditCards.json", []);
    const cardIndex = creditCards.findIndex(card => card.userId === userId);

    if (cardIndex === -1) return undefined;

    creditCards[cardIndex] = {
      ...creditCards[cardIndex],
      isVerified,
      updatedAt: new Date().toISOString(),
    };

    await this.writeJSONFile("creditCards.json", creditCards);
    return creditCards[cardIndex];
  }

  async getAllCreditCards(): Promise<CreditCardDetails[]> {
    return await this.readJSONFile<CreditCardDetails[]>("creditCards.json", []);
  }

  async getActivityLogsByUser(userId: number): Promise<any[]> {
    const activityLogs = await this.readJSONFile<any[]>("activityLogs.json", []);
    return activityLogs.filter(log => log.userId === userId);
  }
}

export const storage = new LocalFileStorage();
