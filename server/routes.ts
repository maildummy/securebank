import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signInSchema, signUpSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  async function requireAuth(req: any, res: any, next: any) {
    const sessionId = req.headers['x-session-id'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  }

  // Admin middleware
  async function requireAdmin(req: any, res: any, next: any) {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  }

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signUpSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create session
      const sessionId = nanoid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createSession(sessionId, user.id, expiresAt);

      res.json({ 
        user: { ...user, password: undefined }, 
        sessionId,
        message: "Account created successfully. Your account is under review." 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { identifier, password } = signInSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const sessionId = nanoid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createSession(sessionId, user.id, expiresAt);

      res.json({ 
        user: { ...user, password: undefined }, 
        sessionId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteSession(req.sessionId);
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // User routes
  app.get("/api/user/me", requireAuth, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  app.get("/api/user/conversations", requireAuth, async (req: any, res) => {
    try {
      const conversations = await storage.getConversationsForUser(req.user.id);
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const partnerId = conv.senderId === req.user.id ? conv.receiverId : conv.senderId;
          const partner = await storage.getUser(partnerId!);
          const unreadCount = await storage.getUnreadMessageCount(req.user.id);
          
          return {
            id: conv.id,
            partner: partner ? { ...partner, password: undefined } : null,
            lastMessage: conv.content,
            timestamp: conv.createdAt,
            unreadCount: conv.senderId !== req.user.id && !conv.isRead ? 1 : 0,
          };
        })
      );
      
      res.json(conversationsWithUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(user => ({ ...user, password: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/status", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, message } = req.body;
      
      if (!['approved', 'rejected', 'suspended'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedUser = await storage.updateUserStatus(parseInt(id), status);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send notification message to user
      if (message) {
        await storage.createMessage({
          senderId: req.user.id,
          receiverId: parseInt(id),
          content: message,
        });
      }

      res.json({ ...updatedUser, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const pendingUsers = allUsers.filter(u => u.status === 'pending');
      const unreadCount = await storage.getUnreadMessageCount(req.user.id);
      
      res.json({
        totalUsers: allUsers.length,
        pendingCount: pendingUsers.length,
        unreadMessages: unreadCount,
        activeToday: allUsers.filter(u => {
          const today = new Date();
          const userDate = new Date(u.updatedAt);
          return userDate.toDateString() === today.toDateString();
        }).length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Message routes
  app.get("/api/messages/:userId", requireAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getMessagesBetweenUsers(req.user.id, parseInt(userId));
      
      // Mark messages as read
      await storage.markMessagesAsRead(parseInt(userId), req.user.id);
      
      // Get sender info for each message
      const messagesWithSenders = await Promise.all(
        messages.map(async (msg) => {
          const sender = await storage.getUser(msg.senderId!);
          return {
            ...msg,
            sender: sender ? { ...sender, password: undefined } : null,
          };
        })
      );
      
      res.json(messagesWithSenders.reverse());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });
      
      const message = await storage.createMessage(messageData);
      const sender = await storage.getUser(message.senderId!);
      
      res.json({
        ...message,
        sender: sender ? { ...sender, password: undefined } : null,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
