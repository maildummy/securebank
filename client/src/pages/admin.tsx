import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, ActivityLog, AdminLoginAttempt, Message } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Clock, 
  Users, 
  Mail, 
  TrendingUp,
  Building,
  Menu,
  Bell,
  ShieldAlert,
  Check,
  X as XIcon,
  AlertTriangle,
  User as UserIcon,
  Activity,
  Shield,
  LogOut,
  Trash2,
  Send,
  CheckCheck,
  CreditCard,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Settings,
  X
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  pendingCount: number;
  unreadMessages: number;
  activeToday: number;
}

interface UserSession {
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  ip: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
  };
}

interface LoginAttempt {
  id: string;
  username: string;
  ip: string;
  timestamp: string;
  approved: boolean | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface UserDetails {
  user: User;
  activityLogs: ActivityLog[];
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<AdminLoginAttempt | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showActionConfirmDialog, setShowActionConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [showMessagingDialog, setShowMessagingDialog] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<User | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [showCardDetailsDialog, setShowCardDetailsDialog] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    enableNotifications: true,
    enableAutoLogout: true,
    autoLogoutMinutes: 30,
    enableMaintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
    backupInterval: "daily"
  });
  const notificationRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [selectedUserHasCard, setSelectedUserHasCard] = useState(false);
  const [showDeleteMessageConfirm, setShowDeleteMessageConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  
  // Handle click outside notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!sessionId,
    meta: { sessionId },
  });

  const { data: stats = { totalUsers: 0, pendingCount: 0, unreadMessages: 0, activeToday: 0 } } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
    enabled: !!sessionId,
    meta: { sessionId },
  });

  const { data: loginAttempts = [], refetch: refetchLoginAttempts } = useQuery<AdminLoginAttempt[]>({
    queryKey: ["/api/admin/login-attempts"],
    enabled: !!sessionId,
    refetchInterval: 10000, // Refetch every 10 seconds
    meta: { sessionId },
  });
  
  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
    enabled: !!sessionId && activeTab === "activity",
    meta: { sessionId },
  });
  
  const { data: activeSessions = [] } = useQuery<UserSession[]>({
    queryKey: ["/api/admin/active-sessions"],
    enabled: !!sessionId && activeTab === "security",
    refetchInterval: activeTab === "security" ? 30000 : false, // Refetch every 30 seconds when on security tab
    meta: { sessionId },
  });
  
  const { data: userData = { user: {} as User, activityLogs: [] } } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUser],
    enabled: !!sessionId && !!selectedUser,
    meta: { sessionId },
  });
  
  // Fetch notifications
  const { data: notificationData } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["/api/admin/notifications"],
    enabled: !!sessionId,
    refetchInterval: 30000, // Refetch every 30 seconds
    meta: { sessionId },
  });
  
  // Update notifications state when data changes
  useEffect(() => {
    if (notificationData?.notifications) {
      setNotifications(notificationData.notifications);
      setUnreadCount(notificationData.notifications.filter(n => !n.read).length);
    }
  }, [notificationData]);

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status, message }: { userId: number; status: string; message?: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
        body: JSON.stringify({ status, message }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "User status updated",
        description: "The user has been notified of the status change.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveLoginAttemptMutation = useMutation({
    mutationFn: async ({ attemptId, approved }: { attemptId: string; approved: boolean }) => {
      const response = await fetch(`/api/admin/approve-login/${attemptId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
        body: JSON.stringify({ approved }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/login-attempts"] });
      setShowLoginDialog(false);
      setSelectedAttempt(null);
      toast({
        title: "Login attempt processed",
        description: "Your decision has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to process login attempt",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowPasswordResetDialog(false);
      setNewPassword("");
      toast({
        title: "Password reset successful",
        description: "The user has been notified of the password change.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionIdToTerminate: string) => {
      const response = await fetch(`/api/admin/sessions/${sessionIdToTerminate}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/active-sessions"] });
      toast({
        title: "Session terminated",
        description: "The user session has been terminated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to terminate session",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowUserDetailsDialog(false);
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted from the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mark notification as read
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark notification as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mark all notifications as read
  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/notifications/read-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark all notifications as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Message handling
  const handleOpenMessaging = (user: User) => {
    setMessageRecipient(user);
    setShowMessagingDialog(true);
    
    // Fetch messages when opening dialog
    if (user) {
      fetchMessages(user.id);
    }
  };
  
  const fetchMessages = (userId: number) => {
    if (!userId) return;
    
    fetch(`/api/messages/${userId}`, {
      headers: {
        "Authorization": `Bearer ${sessionId}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        setMessages(data);
        setMessageRecipient(users.find(u => u.id === userId));
        setShowMessagingDialog(true);
      })
      .catch(error => {
        console.error("Error fetching messages:", error);
        setMessages([]);
      });
  };
  
  const markMessagesAsRead = (userId: number) => {
    if (!userId) return;
    
    fetch(`/api/messages/read/${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sessionId}`,
      },
    })
      .then(() => {
        // Update local state to mark messages as read
        setMessages(prev => 
          prev.map(msg => 
            msg.senderId === userId ? { ...msg, isRead: true } : msg
          )
        );
        
        // Refresh unread count in the user list
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      })
      .catch(error => {
        console.error("Error marking messages as read:", error);
      });
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: number; content: string }) => {
      console.log("Sending message to:", recipientId, "Content:", content);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
        body: JSON.stringify({ 
          receiverId: recipientId, 
          content 
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error sending message:", errorText);
        throw new Error(errorText || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
      // Add the new message to the messages list
      setMessages((prev) => [...prev, data]);
      // Clear the message input
      setMessageText("");
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error: Error) => {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message",
        variant: "destructive",
      });
    },
  });
  
  const handleSendMessage = () => {
    if (!messageRecipient || !messageText.trim() || !sessionId) {
      console.log("Cannot send message:", { 
        messageRecipient: !!messageRecipient, 
        messageText: !!messageText.trim(), 
        sessionId: !!sessionId 
      });
      return;
    }
    
    console.log("Sending message to:", messageRecipient.id, "Content:", messageText);
    
    sendMessageMutation.mutate({
      recipientId: messageRecipient.id,
      content: messageText.trim(),
    });
  };
  
  // Set up polling for messages
  useEffect(() => {
    if (!showMessagingDialog || !messageRecipient || !sessionId) return;
    
    const intervalId = setInterval(() => {
      fetchMessages(messageRecipient.id);
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(intervalId);
  }, [showMessagingDialog, messageRecipient, sessionId]);

  // Fetch credit cards
  const { data: creditCardsData } = useQuery({
    queryKey: ["/api/admin/credit-cards"],
    enabled: !!sessionId && activeTab === "cards",
    meta: { sessionId }
  });

  useEffect(() => {
    if (creditCardsData) {
      setCreditCards(creditCardsData);
    }
  }, [creditCardsData]);

  // View card details function
  const viewCardDetails = async (data: { userId: number }) => {
    try {
      setShowCardDetailsDialog(true);
      
      const response = await fetch(`/api/admin/credit-cards/${data.userId}`, {
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const cardData = await response.json();
      console.log("Card details received:", cardData);
      setSelectedCard(cardData);
    } catch (error: any) {
      console.error("Error fetching card details:", error);
      toast({
        title: "Error",
        description: "Failed to load credit card details",
        variant: "destructive",
      });
    }
  };

  // Verify card function
  const verifyCard = async (userId: number, isVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/credit-cards/${userId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
        body: JSON.stringify({ isVerified }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Refresh credit cards data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-cards"] });

      toast({
        title: isVerified ? "Card Verified" : "Card Verification Removed",
        description: isVerified 
          ? "The credit card has been verified successfully." 
          : "The credit card verification has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!user.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  const handleApprove = (userId: number) => {
    updateUserStatusMutation.mutate({
      userId,
      status: "approved",
      message: "Congratulations! Your account has been approved. You now have full access to all SecureBank features. Welcome aboard! 🎉",
    });
  };

  const handleReject = (userId: number) => {
    updateUserStatusMutation.mutate({
      userId,
      status: "rejected",
      message: "We're sorry, but your account application has been rejected. Please contact support for more information.",
    });
  };

  const handleSuspend = (userId: number) => {
    updateUserStatusMutation.mutate({
      userId,
      status: "suspended",
      message: "Your account has been temporarily suspended. Please contact support for assistance.",
    });
  };

  const handleLoginAttemptClick = (attempt: LoginAttempt) => {
    setSelectedAttempt(attempt);
    setShowLoginDialog(true);
  };

  const handleApproveLogin = () => {
    if (selectedAttempt) {
      approveLoginAttemptMutation.mutate({
        attemptId: selectedAttempt.id,
        approved: true,
      });
    }
  };

  const handleDenyLogin = () => {
    if (selectedAttempt) {
      approveLoginAttemptMutation.mutate({
        attemptId: selectedAttempt.id,
        approved: false,
      });
    }
  };
  
  const handleUserClick = (userId: number) => {
    setSelectedUser(userId);
    fetchUserDetails(userId);
  };
  
  const handleResetPassword = () => {
    if (selectedUser && newPassword) {
      resetPasswordMutation.mutate({
        userId: selectedUser,
        newPassword,
      });
    }
  };
  
  const handleTerminateSession = (sessionId: string) => {
    terminateSessionMutation.mutate(sessionId);
  };
  
  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteConfirmDialog(true);
  };
  
  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
      setShowDeleteConfirmDialog(false);
    }
  };
  
  const handleActionClick = (type: 'approve' | 'reject' | 'suspend', userId: number) => {
    setActionType(type);
    setSelectedUser(userId);
    setShowActionConfirmDialog(true);
  };
  
  const confirmAction = () => {
    if (!selectedUser || !actionType) return;
    
    if (actionType === 'approve') {
      handleApprove(selectedUser);
    } else if (actionType === 'reject') {
      handleReject(selectedUser);
    } else if (actionType === 'suspend') {
      handleSuspend(selectedUser);
    }
    
    setShowActionConfirmDialog(false);
  };
  
  const handleNotificationClick = (notificationId: string) => {
    markNotificationReadMutation.mutate(notificationId);
    
    // Find the notification
    const notification = notifications.find(n => n.id === notificationId);
    
    // Handle different notification types
    if (notification && notification.title.includes("New User")) {
      // Find the user ID from the message and open user details
      const userId = parseInt(notification.message.match(/User ID: (\d+)/)?.[1] || "0");
      if (userId) {
        setSelectedUser(userId);
        setShowUserDetailsDialog(true);
      }
    } else if (notification && notification.title.includes("Login Attempt")) {
      // Find the attempt ID from the message
      const attemptId = notification.message.match(/Attempt ID: ([a-zA-Z0-9_-]+)/)?.[1];
      if (attemptId) {
        const attempt = loginAttempts.find(a => a.id === attemptId);
        if (attempt) {
          setSelectedAttempt(attempt);
          setShowLoginDialog(true);
        }
      }
    }
    
    // Close the notifications dropdown
    setShowNotifications(false);
  };
  
  const handleMarkAllRead = () => {
    markAllNotificationsReadMutation.mutate();
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "System settings have been updated successfully.",
    });
    setShowSettingsDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case "suspended":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || "U";
  };

  // Filter users based on search and status
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = searchQuery 
      ? user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const hasLoginAttempts = loginAttempts && loginAttempts.length > 0;

  // Fetch user details
  const fetchUserDetails = async (userId: number) => {
    try {
      console.log("Fetching user details for:", userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const userData = await response.json();
      console.log("User details received:", userData);
      setUserDetails(userData);
      
      // Check if user has submitted card details
      const cardResponse = await fetch(`/api/admin/credit-cards/${userId}/check`, {
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (cardResponse.ok) {
        const cardData = await cardResponse.json();
        setSelectedUserHasCard(cardData.hasSubmittedCard);
      }
      
      setShowUserDetailsDialog(true);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user details",
        variant: "destructive",
      });
    }
  };

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully",
      });
      
      // Refresh messages
      if (messageRecipient) {
        fetchMessages(messageRecipient.id);
      }
      
      setShowDeleteMessageConfirm(false);
      setMessageToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMessage = (messageId: number) => {
    setMessageToDelete(messageId);
    setShowDeleteMessageConfirm(true);
  };

  const confirmDeleteMessage = () => {
    if (messageToDelete !== null) {
      deleteMessageMutation.mutate(messageToDelete);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mr-2">
                    <Building className="w-5 h-5 text-white" />
            </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      SecureBank
                    </span>
                    <span className="text-xs text-gray-600 leading-none">Professional Banking</span>
                </div>
                </a>
                <span className="ml-4 text-gray-600 hidden md:inline">|</span>
                <span className="ml-4 text-gray-700 hidden md:inline font-medium">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 p-2"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-600 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" ref={notificationRef}>
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id)}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                    notification.title.includes("New User") 
                                      ? 'bg-green-100 text-green-600' 
                                      : notification.title.includes("Login") 
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {notification.title.includes("New User") ? (
                                      <UserIcon className="h-4 w-4" />
                                    ) : notification.title.includes("Login") ? (
                                      <ShieldAlert className="h-4 w-4" />
                                    ) : (
                                      <Bell className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div className="ml-3 w-full">
                                    <div className="flex justify-between">
                                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {notification.message}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Profile dropdown */}
                <div className="relative">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getUserInitials(user.firstName, user.lastName)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Administrator
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Settings and Logout buttons */}
                <div className="flex">
                  <Button 
                    onClick={() => setShowSettingsDialog(true)} 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                  >
                    Settings
                  </Button>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pt-4 pb-3 space-y-3">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials(user.firstName, user.lastName)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                  <p className="text-sm font-medium text-gray-500">Administrator</p>
                </div>
              </div>
              
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full"
                >
                  <Bell className="mr-3 h-6 w-6 text-gray-500" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setShowSettingsDialog(true)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full"
                >
                  <span className="mr-3 h-6 w-6 text-gray-500">⚙️</span>
                  Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full"
                >
                  <LogOut className="mr-3 h-6 w-6 text-gray-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Alert Banner */}
        {hasLoginAttempts && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-bold">Security Alert:</span> {loginAttempts.length} admin login {loginAttempts.length === 1 ? 'attempt' : 'attempts'} pending your approval.
                </p>
              </div>
              <div className="ml-auto">
                <Button 
                  onClick={() => handleLoginAttemptClick(loginAttempts[0])} 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Review Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.pendingCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.unreadMessages || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.activeToday || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Attempts Section (if any) */}
        {hasLoginAttempts && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <ShieldAlert className="w-5 h-5 text-red-600 mr-2" />
                Pending Admin Login Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loginAttempts.map((attempt: LoginAttempt) => (
                  <div key={attempt.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">Login attempt from IP: {attempt.ip}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleLoginAttemptClick(attempt)} 
                        variant="outline" 
                        size="sm"
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Management Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Input 
                  placeholder="Search users..." 
                  className="w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: User & { unreadMessageCount?: number }) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getUserInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUserClick(user.id)}
                          title="View Details"
                        >
                          <UserIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenMessaging(user)}
                          title="Message User"
                          className="relative"
                        >
                          <Mail className="h-4 w-4" />
                          {user.unreadMessageCount && user.unreadMessageCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                              {user.unreadMessageCount}
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleActionClick('approve', user.id)}
                          disabled={user.status === 'approved'}
                          title="Approve User"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleActionClick('reject', user.id)}
                          disabled={user.status === 'rejected'}
                          title="Reject User"
                        >
                          <XIcon className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 mb-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-bank-blue-100 data-[state=active]:text-bank-blue-900">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-bank-blue-100 data-[state=active]:text-bank-blue-900">
              Users
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-bank-blue-100 data-[state=active]:text-bank-blue-900">
              Messages
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:bg-bank-blue-100 data-[state=active]:text-bank-blue-900">
              Credit Cards
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-bank-blue-100 data-[state=active]:text-bank-blue-900">
              Settings
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="overview">
          {/* Existing login attempts and user management table goes here */}
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                System Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No activity logs found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(activityLogs) && activityLogs.map((log: ActivityLog) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {log.user?.username || `User #${log.userId}`}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge variant="outline" className="capitalize">
                                {log.action.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {log.details}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {log.ip}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active sessions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeSessions.map((session) => (
                          <tr key={session.sessionId} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {session.user.firstName && session.user.lastName 
                                      ? getUserInitials(session.user.firstName, session.user.lastName)
                                      : session.user.username.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {session.user.firstName && session.user.lastName 
                                      ? `${session.user.firstName} ${session.user.lastName}`
                                      : session.user.username}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {session.user.isAdmin ? 'Admin' : 'User'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{session.ip}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(session.lastActivity).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(session.expiresAt).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Button 
                                onClick={() => handleTerminateSession(session.sessionId)} 
                                variant="outline" 
                                size="sm"
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              >
                                <LogOut className="w-4 h-4 mr-1" />
                                Terminate
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Credit Card Management</h3>
              </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credit Card Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Card Number</TableHead>
                        <TableHead>Cardholder Name</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditCards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No credit card submissions yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        creditCards.map((card) => (
                          <TableRow key={card.id}>
                            <TableCell>
                              <div className="font-medium">{card.user?.username || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{card.user?.email || 'No email'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono">{card.cardNumber}</div>
                            </TableCell>
                            <TableCell>{card.cardholderName}</TableCell>
                            <TableCell>{card.expiryMonth}/{card.expiryYear}</TableCell>
                            <TableCell>
                              {card.isVerified ? (
                                <Badge variant="success">Verified</Badge>
                              ) : (
                                <Badge variant="warning">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewCardDetails({ userId: card.userId })}
                                >
                                  View Details
                                </Button>
                                {!card.isVerified && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => verifyCard(card.userId, true)}
                                  >
                                    Verify
                                  </Button>
                                )}
              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
            </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Login Approval Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              Security Alert: Admin Login Attempt
            </DialogTitle>
            <DialogDescription>
              Someone is attempting to log in to your admin account. Please review the details below.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttempt && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">IP Address</p>
                  <p className="text-base font-semibold">{selectedAttempt.ip}</p>
        </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-base font-semibold">{selectedAttempt.username}</p>
      </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-base font-semibold">{new Date(selectedAttempt.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700 mb-4">
                  Is this you attempting to log in? If not, we recommend denying this request and changing your password immediately.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button 
                    onClick={handleDenyLogin}
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Deny Login
                  </Button>
                  <Button 
                    onClick={handleApproveLogin}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Login
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          
          {userDetails?.user && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500">Username</Label>
                      <p className="font-medium">{userDetails.user.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Email</Label>
                      <p>{userDetails.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Password (Plaintext)</Label>
                      <p className="font-mono">{userDetails.user.password}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(userDetails.user.status || 'pending')}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Created At</Label>
                      <p>{new Date(userDetails.user.createdAt || '').toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        onClick={() => {
                          setShowUserDetailsDialog(false);
                          setShowPasswordResetDialog(true);
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        Reset Password
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowUserDetailsDialog(false);
                          handleActionClick('approve', userDetails.user.id);
                        }}
                        variant="outline" 
                        size="sm"
                        className="bg-green-50 text-green-700 hover:bg-green-100"
                        disabled={userDetails.user.status === 'approved'}
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowUserDetailsDialog(false);
                          handleActionClick('suspend', userDetails.user.id);
                        }}
                        variant="outline" 
                        size="sm"
                        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        disabled={userDetails.user.status === 'suspended'}
                      >
                        Suspend
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowUserDetailsDialog(false);
                          handleActionClick('reject', userDetails.user.id);
                        }}
                        variant="outline" 
                        size="sm"
                        className="bg-red-50 text-red-700 hover:bg-red-100"
                        disabled={userDetails.user.status === 'rejected'}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">First Name</Label>
                        <p>{userDetails.user.firstName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Last Name</Label>
                        <p>{userDetails.user.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Phone</Label>
                      <p>{userDetails.user.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Date of Birth</Label>
                      <p>{userDetails.user.dateOfBirth}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Address</Label>
                      <p>{userDetails.user.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">City</Label>
                        <p>{userDetails.user.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">State</Label>
                        <p>{userDetails.user.state}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">ZIP Code</Label>
                        <p>{userDetails.user.zipCode}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Country</Label>
                        <p>{userDetails.user.country}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      {selectedUserHasCard ? (
                        <Button 
                          onClick={() => {
                            viewCardDetails({ userId: userDetails.user.id });
                            setShowUserDetailsDialog(false);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          View Credit Card Details
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          No Card Details Submitted
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => {
                    setMessageRecipient(userDetails.user);
                    setShowMessagingDialog(true);
                    setShowUserDetailsDialog(false);
                  }}
                  variant="outline"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message User
                </Button>
                <Button 
                  onClick={() => {
                    setShowUserDetailsDialog(false);
                    setUserToDelete(userDetails.user.id);
                    setShowDeleteConfirmDialog(true);
                  }}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Reset User Password
            </DialogTitle>
            <DialogDescription>
              Enter a new password for this user. The user will be notified and all their active sessions will be terminated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="text" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter new password"
              />
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button 
                onClick={() => setShowPasswordResetDialog(false)} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={!newPassword || newPassword.length < 8}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* System Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              System Settings
            </DialogTitle>
            <DialogDescription>
              Configure global system settings and preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notification Settings</h4>
                
            <div className="flex items-center justify-between">
                  <Label htmlFor="enableNotifications">Enable Notifications</Label>
                  <input
                    id="enableNotifications"
                    type="checkbox"
                    checked={systemSettings.enableNotifications}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      enableNotifications: e.target.checked
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
              </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Security Settings</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAutoLogout">Enable Auto Logout</Label>
                  <input
                    id="enableAutoLogout"
                    type="checkbox"
                    checked={systemSettings.enableAutoLogout}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      enableAutoLogout: e.target.checked
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
            </div>
                
                <div>
                  <Label htmlFor="autoLogoutMinutes">Auto Logout After (minutes)</Label>
                  <Input
                    id="autoLogoutMinutes"
                    type="number"
                    value={systemSettings.autoLogoutMinutes}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      autoLogoutMinutes: parseInt(e.target.value) || 30
                    })}
                    className="mt-1"
                    disabled={!systemSettings.enableAutoLogout}
                  />
          </div>
        </div>
      </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Maintenance Settings</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableMaintenanceMode">Enable Maintenance Mode</Label>
                <input
                  id="enableMaintenanceMode"
                  type="checkbox"
                  checked={systemSettings.enableMaintenanceMode}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    enableMaintenanceMode: e.target.checked
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Input
                  id="maintenanceMessage"
                  value={systemSettings.maintenanceMessage}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    maintenanceMessage: e.target.value
                  })}
                  className="mt-1"
                  disabled={!systemSettings.enableMaintenanceMode}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Backup Settings</h4>
              
              <div>
                <Label htmlFor="backupInterval">Backup Interval</Label>
                <Select 
                  value={systemSettings.backupInterval}
                  onValueChange={(value) => setSystemSettings({
                    ...systemSettings,
                    backupInterval: value
                  })}
                >
                  <SelectTrigger id="backupInterval" className="w-full">
                    <SelectValue placeholder="Select backup interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  Backup Now
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button 
                onClick={() => setShowSettingsDialog(false)} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Confirm User Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button 
              onClick={() => setShowDeleteConfirmDialog(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Action Confirmation Dialog */}
      <Dialog open={showActionConfirmDialog} onOpenChange={setShowActionConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {actionType === 'approve' && 'Confirm Approval'}
              {actionType === 'reject' && 'Confirm Rejection'}
              {actionType === 'suspend' && 'Confirm Suspension'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Are you sure you want to approve this user? They will gain access to all platform features.'}
              {actionType === 'reject' && 'Are you sure you want to reject this user? They will be notified of this decision.'}
              {actionType === 'suspend' && 'Are you sure you want to suspend this user? Their access will be temporarily restricted.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button 
              onClick={() => setShowActionConfirmDialog(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              className={`text-white ${
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 
                'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {actionType === 'approve' && 'Approve User'}
              {actionType === 'reject' && 'Reject User'}
              {actionType === 'suspend' && 'Suspend User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Messaging Dialog */}
      <Dialog open={showMessagingDialog} onOpenChange={setShowMessagingDialog}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {messageRecipient ? `Chat with ${messageRecipient.firstName} ${messageRecipient.lastName}` : 'Messages'}
            </DialogTitle>
            <button onClick={() => setShowMessagingDialog(false)} className="text-gray-400 hover:text-gray-600">
              <XIcon className="h-5 w-5" />
            </button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isAdminMessage = message.senderId === user?.id;
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isAdminMessage && messageRecipient && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">SB</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="max-w-[70%]">
                      <div 
                        className={`rounded-lg px-4 py-2 ${
                          isAdminMessage 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`flex items-center mt-1 ${
                        isAdminMessage ? 'justify-end' : 'justify-start'
                      }`}>
                        <p className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                        {isAdminMessage && message.isRead && (
                          <CheckCheck className="w-3 h-3 text-blue-500 ml-1" />
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-5 w-5 ml-1 text-gray-400 hover:text-red-500"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {isAdminMessage && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getUserInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {sendMessageMutation.isPending ? "Sending..." : (
                  <>
                    <span className="mr-1">Send</span>
                    <Send size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Card Details Dialog */}
      <Dialog open={showCardDetailsDialog} onOpenChange={setShowCardDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Credit Card Details
            </DialogTitle>
            <DialogDescription>
              Full credit card information for user
            </DialogDescription>
          </DialogHeader>
          
          {selectedCard && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Card Information</h3>
                  <div>
                    <Label className="text-sm text-gray-500">Card Number</Label>
                    <p className="font-mono">{selectedCard.cardNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Cardholder Name</Label>
                    <p>{selectedCard.cardholderName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Expiry Date</Label>
                      <p>{selectedCard.expiryMonth}/{selectedCard.expiryYear}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">CVV/CVC/CID</Label>
                      <p className="font-mono">{selectedCard.cvv}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Current Credit Limit</Label>
                    <p className="font-semibold">${selectedCard.creditLimit}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <Badge className={selectedCard.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {selectedCard.isVerified ? "Verified" : "Pending Verification"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Billing Information</h3>
                  <div>
                    <Label className="text-sm text-gray-500">Billing Address</Label>
                    <p>{selectedCard.billingAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">City</Label>
                      <p>{selectedCard.billingCity}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">State/Province</Label>
                      <p>{selectedCard.billingState}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">ZIP/Postal Code</Label>
                      <p>{selectedCard.billingZip}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Country</Label>
                      <p>{selectedCard.billingCountry}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-lg mb-4">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Username</Label>
                    <p>{selectedCard.user?.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p>{selectedCard.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Full Name</Label>
                    <p>{selectedCard.user?.firstName} {selectedCard.user?.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Account Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedCard.user?.status || 'pending')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setShowCardDetailsDialog(false)}
                  variant="outline"
                >
                  Close
                </Button>
                <div className="space-x-3">
                  <Button 
                    onClick={() => {
                      setShowMessagingDialog(true);
                      setMessageRecipient(users.find(u => u.id === selectedCard.userId));
                      setShowCardDetailsDialog(false);
                    }}
                    variant="outline"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message User
                  </Button>
                  <Button 
                    onClick={() => verifyCard(selectedCard.userId, !selectedCard.isVerified)}
                    className={selectedCard.isVerified 
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                    }
                  >
                    {selectedCard.isVerified ? "Remove Verification" : "Verify Card"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Dialog */}
      <Dialog open={showDeleteMessageConfirm} onOpenChange={setShowDeleteMessageConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Confirm Message Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button 
              onClick={() => setShowDeleteMessageConfirm(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteMessage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
