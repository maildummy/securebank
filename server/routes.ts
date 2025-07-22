import { Express } from "express";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const sessionId = authHeader.split(' ')[1];
  const session = storage.sessions.find(s => s.id === sessionId);
  
  if (!session) {
    return res.status(401).json({ message: "Invalid session" });
  }
  
  const user = storage.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    storage.sessions = storage.sessions.filter(s => s.id !== sessionId);
    return res.status(401).json({ message: "Session expired" });
  }
  
  // Attach user and session to the request
  req.user = user;
  req.session = session;
  next();
};

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  requireAuth(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};

// Routes
export async function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = storage.users.find(u => 
      u.email === email || u.username === email
    );
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Special handling for admin user - always approved
    if (user.isAdmin) {
      // Create a session
      const session = {
        id: uuidv4(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      
      storage.sessions.push(session);
      await storage.saveData("sessions");
      
      // Return user and session
      const { password, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword, sessionId: session.id });
    }
    
    // Regular user flow - check approval status
    if (!user.approved) {
      return res.status(403).json({ message: "Account pending approval" });
    }
    
    if (user.suspended) {
      return res.status(403).json({ message: "Account suspended" });
    }
    
    // Create a session
    const session = {
      id: uuidv4(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    storage.sessions.push(session);
    await storage.saveData("sessions");
    
    // Return user and session
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, sessionId: session.id });
  });

  // Signup endpoint
  app.post("/api/signup", async (req, res) => {
    const { email, username, password, firstName, lastName, phone, address, country } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Email, username and password are required" });
    }
    
    // Check if email or username already exists
    if (storage.users.some(u => u.email === email)) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    if (storage.users.some(u => u.username === username)) {
      return res.status(400).json({ message: "Username already in use" });
    }
    
    // Create user with hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      // Store original password in secure note field for admin viewing ONLY in this demo app
      // In a real app, we would NEVER do this
      secureNote: `DEMO APP ONLY - Original password: ${password}`,
      isAdmin: false,
      approved: false,
      suspended: false,
      firstName: firstName || "",
      lastName: lastName || "",
      phone: phone || "",
      address: address || "",
      country: country || "",
      createdAt: new Date().toISOString()
    };
    
    storage.users.push(user);
    await storage.saveData("users");
    
    // Create a session for the new user
    const session = {
      id: uuidv4(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    storage.sessions.push(session);
    await storage.saveData("sessions");
    
    // Notify admin
    const adminUser = storage.users.find(u => u.isAdmin);
    
    if (adminUser) {
      const notification = {
        id: uuidv4(),
        userId: adminUser.id,
        message: `New user signed up: ${username} (${email})`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      storage.notifications.push(notification);
      await storage.saveData("notifications");
      
      // Send welcome message from admin to new user
      const welcomeMessage = {
        id: uuidv4(),
        senderId: adminUser.id,
        receiverId: user.id,
        content: "Welcome to SecureBank! If you have any questions or need assistance, feel free to message us here.",
        timestamp: new Date().toISOString(),
        read: false
      };
      
      storage.messages.push(welcomeMessage);
      await storage.saveData("messages");
    }
    
    // Don't return the password
    const { password: _, secureNote: __, ...userWithoutPassword } = user;
    
    return res.status(201).json({ 
      user: userWithoutPassword, 
      sessionId: session.id,
      message: "Account created successfully, awaiting approval." 
    });
  });

  // Logout endpoint
  app.post("/api/logout", requireAuth, async (req: any, res) => {
    // Remove the session
    storage.sessions = storage.sessions.filter(s => s.id !== req.session.id);
    await storage.saveData("sessions");
    
    res.json({ message: "Logged out successfully" });
  });

  // Get current user
  app.get("/api/me", requireAuth, (req: any, res) => {
    const { password: _, secureNote: __, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Submit credit card
  app.post("/api/credit-cards", requireAuth, async (req: any, res) => {
    const { cardNumber, cardholderName, expiryDate, cvv } = req.body;
    
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      return res.status(400).json({ message: "All card details are required" });
    }
    
    // Validate card number format
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ message: "Invalid card number" });
    }
    
    // Validate expiry date format (MM/YY)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      return res.status(400).json({ message: "Invalid expiry date" });
    }
    
    // Validate CVV format
    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({ message: "Invalid CVV" });
    }

    // Generate dummy tokens instead of storing actual card data
    // In a real app, we would use a payment processor's secure tokenization
    const last4 = cardNumber.slice(-4);
    const cardToken = `token_${Buffer.from(cardNumber).toString('base64').substring(0, 10)}`;
    const expiryToken = `exp_${Buffer.from(expiryDate).toString('base64').substring(0, 6)}`;
    const cvvToken = `cvv_${Buffer.from(cvv).toString('base64').substring(0, 6)}`;
    
    const creditCard = {
      id: uuidv4(),
      userId: req.user.id,
      cardholderName,
      last4,
      cardToken,
      expiryToken,
      cvvToken,
      approved: false,
      createdAt: new Date().toISOString()
    };
    
    storage.creditCards.push(creditCard);
    await storage.saveData("creditCards");
    
    // Notify admin
    const adminUser = storage.users.find(u => u.isAdmin);
    
    if (adminUser) {
      const notification = {
        id: uuidv4(),
        userId: adminUser.id,
        message: `New credit card submitted by ${req.user.username} (${req.user.email})`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      storage.notifications.push(notification);
      await storage.saveData("notifications");
    }
    
    // Only return safe fields
    const { cardToken: _, expiryToken: __, cvvToken: ___, ...safeCardData } = creditCard;
    
    res.status(201).json({
      card: safeCardData,
      message: "Credit card submitted successfully, awaiting approval."
    });
  });

  // Get user credit cards
  app.get("/api/credit-cards", requireAuth, (req: any, res) => {
    const userCards = storage.creditCards
      .filter(c => c.userId === req.user.id)
      .map(({ cardToken, expiryToken, cvvToken, ...safeCard }) => safeCard);
    
    res.json(userCards);
  });

  // Get messages
  app.get("/api/messages", requireAuth, (req: any, res) => {
    // Get messages where the user is sender or receiver
    const userMessages = storage.messages.filter(
      m => m.senderId === req.user.id || m.receiverId === req.user.id
    );
    
    res.json(userMessages);
  });

  // Send message
  app.post("/api/messages", requireAuth, async (req: any, res) => {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver and content are required" });
    }
    
    // Check if receiver exists
    const receiver = storage.users.find(u => u.id === receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }
    
    const message = {
      id: uuidv4(),
      senderId: req.user.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    storage.messages.push(message);
    await storage.saveData("messages");
    
    // If message is sent to admin, create notification for admin
    if (receiver.isAdmin) {
      const notification = {
        id: uuidv4(),
        userId: receiver.id,
        message: `New message from ${req.user.username}`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      storage.notifications.push(notification);
      await storage.saveData("notifications");
    }
    
    res.status(201).json(message);
  });

  // Mark messages as read
  app.put("/api/messages/read", requireAuth, async (req: any, res) => {
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: "Message IDs are required" });
    }
    
    // Only mark messages addressed to the current user
    storage.messages = storage.messages.map(message => {
      if (message.receiverId === req.user.id && messageIds.includes(message.id)) {
        return { ...message, read: true };
      }
      return message;
    });
    
    await storage.saveData("messages");
    
    res.json({ message: "Messages marked as read" });
  });

  // Get notifications
  app.get("/api/notifications", requireAuth, (req: any, res) => {
    const userNotifications = storage.notifications
      .filter(n => n.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(userNotifications);
  });

  // Mark notifications as read
  app.put("/api/notifications/read", requireAuth, async (req: any, res) => {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: "Notification IDs are required" });
    }
    
    // Only mark notifications for the current user
    storage.notifications = storage.notifications.map(notification => {
      if (notification.userId === req.user.id && notificationIds.includes(notification.id)) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    await storage.saveData("notifications");
    
    res.json({ message: "Notifications marked as read" });
  });

  // Admin routes

  // Get all users
  app.get("/api/admin/users", requireAdmin, (req, res) => {
    // Remove sensitive information
    const safeUsers = storage.users.map(user => {
      // Include secureNote for admin to view original password in this demo
      // In a real app, we would never do this
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        // For demo only to display plaintext password in admin panel
        originalPassword: user.secureNote?.replace("DEMO APP ONLY - Original password: ", "") || "N/A"
      };
    });
    
    res.json(safeUsers);
  });

  // Update user status
  app.put("/api/admin/users/:userId", requireAdmin, async (req: any, res) => {
    const { userId } = req.params;
    const { approved, suspended } = req.body;
    
    const userIndex = storage.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't allow changing admin user's status
    if (storage.users[userIndex].isAdmin) {
      return res.status(403).json({ message: "Cannot change admin user's status" });
    }
    
    if (approved !== undefined) {
      storage.users[userIndex].approved = approved;
    }
    
    if (suspended !== undefined) {
      storage.users[userIndex].suspended = suspended;
    }
    
    await storage.saveData("users");
    
    // If user is now approved, create a notification for them
    if (approved === true && !storage.users[userIndex].approved) {
      const notification = {
        id: uuidv4(),
        userId,
        message: "Your account has been approved!",
        read: false,
        createdAt: new Date().toISOString()
      };
      
      storage.notifications.push(notification);
      await storage.saveData("notifications");
      
      // Also send a message
      const message = {
        id: uuidv4(),
        senderId: req.user.id,
        receiverId: userId,
        content: "Your account has been approved. You can now use all features of SecureBank.",
        timestamp: new Date().toISOString(),
        read: false
      };
      
      storage.messages.push(message);
      await storage.saveData("messages");
    }
    
    const { password: _, ...userWithoutPassword } = storage.users[userIndex];
    res.json(userWithoutPassword);
  });

  // Delete user
  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    const { userId } = req.params;
    
    const userIndex = storage.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't allow deleting admin user
    if (storage.users[userIndex].isAdmin) {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }
    
    // Remove user
    storage.users.splice(userIndex, 1);
    await storage.saveData("users");
    
    // Remove all related data
    // Sessions
    storage.sessions = storage.sessions.filter(s => s.userId !== userId);
    await storage.saveData("sessions");
    
    // Notifications
    storage.notifications = storage.notifications.filter(n => n.userId !== userId);
    await storage.saveData("notifications");
    
    // Credit cards
    storage.creditCards = storage.creditCards.filter(c => c.userId !== userId);
    await storage.saveData("creditCards");
    
    // Messages
    storage.messages = storage.messages.filter(m => m.senderId !== userId && m.receiverId !== userId);
    await storage.saveData("messages");
    
    res.json({ message: "User and all associated data deleted successfully" });
  });

  // Get all credit cards
  app.get("/api/admin/credit-cards", requireAdmin, (req, res) => {
    // Join with user data for easier admin management
    const cardsWithUsers = storage.creditCards.map(card => {
      const user = storage.users.find(u => u.id === card.userId);
      const userEmail = user ? user.email : "Unknown";
      const username = user ? user.username : "Unknown";
      
      // Return card with user info, excluding token fields
      const { cardToken, expiryToken, cvvToken, ...safeCard } = card;
      return {
        ...safeCard,
        userEmail,
        username
      };
    });
    
    res.json(cardsWithUsers);
  });

  // Approve credit card
  app.put("/api/admin/credit-cards/:cardId", requireAdmin, async (req, res) => {
    const { cardId } = req.params;
    const { approved } = req.body;
    
    const cardIndex = storage.creditCards.findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Credit card not found" });
    }
    
    if (approved !== undefined) {
      storage.creditCards[cardIndex].approved = approved;
    }
    
    await storage.saveData("creditCards");
    
    // Notify user
    const card = storage.creditCards[cardIndex];
    const user = storage.users.find(u => u.id === card.userId);
    
    if (user && approved === true) {
      const notification = {
        id: uuidv4(),
        userId: user.id,
        message: "Your credit card has been approved!",
        read: false,
        createdAt: new Date().toISOString()
      };
      
      storage.notifications.push(notification);
      await storage.saveData("notifications");
    }
    
    const { cardToken, expiryToken, cvvToken, ...safeCard } = storage.creditCards[cardIndex];
    res.json(safeCard);
  });

  // Password reset request
  app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = storage.users.find(u => u.email === email);
    
    if (!user) {
      // Don't reveal if the user exists or not for security
      return res.json({ message: "If your email is registered, you will receive a password reset link" });
    }
    
    // In a real app, we would send an email with a password reset link
    // For this demo, we just notify the admin
    const adminUser = storage.users.find(u => u.isAdmin);
    
    if (adminUser) {
      const notification = {
        id: uuidv4(),
        userId: adminUser.id,
        message: `Password reset requested for ${email}`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      storage.notifications.push(notification);
      await storage.saveData("notifications");
    }
    
    res.json({ message: "If your email is registered, you will receive a password reset link" });
  });

  // Admin reset password
  app.post("/api/admin/reset-password/:userId", requireAdmin, async (req: any, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    
    const userIndex = storage.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and secure note
    storage.users[userIndex].password = hashedPassword;
    storage.users[userIndex].secureNote = `DEMO APP ONLY - Original password: ${newPassword}`;
    
    await storage.saveData("users");
    
    // Notify the user
    const notification = {
      id: uuidv4(),
      userId,
      message: "Your password has been reset by an administrator",
      read: false,
      createdAt: new Date().toISOString()
    };
    
    storage.notifications.push(notification);
    await storage.saveData("notifications");
    
    res.json({ message: "Password reset successfully" });
  });

  // Fallback route for API
  app.all("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });
}
