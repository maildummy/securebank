import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { X, Search, Send, CheckCheck, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MessagingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: number;
  partner: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function MessagingInterface({ isOpen, onClose }: MessagingInterfaceProps) {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/user/conversations"],
    enabled: isOpen && !!sessionId,
    meta: { sessionId },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: isOpen && !!selectedConversation && !!sessionId,
    meta: { sessionId },
    refetchInterval: isOpen && !!selectedConversation ? 5000 : false, // Poll for new messages every 5 seconds
  });

  // Scroll to bottom when new messages are loaded
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; content: string }) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error sending message:", errorText);
        throw new Error(errorText || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh both messages and conversations
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/conversations"] });
      setNewMessage("");
      // Scroll to bottom after sending a message
      setTimeout(scrollToBottom, 100);
    },
    onError: (error: Error) => {
      console.error("Send message error:", error);
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ senderId }: { senderId: number }) => {
      const response = await fetch(`/api/messages/read/${senderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId || ""}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error marking messages as read:", errorText);
        throw new Error(errorText || "Failed to mark messages as read");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/conversations"] });
    },
    onError: (error: Error) => {
      console.error("Failed to mark messages as read:", error);
    },
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    console.log("Sending message to:", selectedConversation, "Content:", newMessage.trim());
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const handleConversationSelect = (partnerId: number) => {
    setSelectedConversation(partnerId);
    // Mark messages as read when conversation is selected
    markAsReadMutation.mutate({ senderId: partnerId });
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conv: Conversation) => {
    if (!searchTerm) return true;
    const partnerName = `${conv.partner?.firstName || ''} ${conv.partner?.lastName || ''}`.toLowerCase();
    const username = (conv.partner?.username || '').toLowerCase();
    return partnerName.includes(searchTerm.toLowerCase()) || username.includes(searchTerm.toLowerCase());
  });

  // Get admin user for new conversations (simplified for demo)
  const adminUserId = 1; // Assuming admin has ID 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        {/* Messaging Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-gray-900">Messages</DialogTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              {/* Default admin conversation */}
              <div 
                onClick={() => handleConversationSelect(adminUserId)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  selectedConversation === adminUserId ? 'border-l-4 border-bank-blue-600 bg-bank-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">SB</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">SecureBank Support</p>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {messages.length > 0 && messages[messages.length - 1]?.content
                          ? messages[messages.length - 1].content.substring(0, 40) + "..."
                          : "Start a conversation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {filteredConversations.find((conv) => conv.partner?.id === adminUserId)?.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {filteredConversations.find((conv) => conv.partner?.id === adminUserId)?.unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 mt-1">
                      {messages.length > 0 && messages[messages.length - 1]?.createdAt
                        ? new Date(messages[messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ""
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Other conversations */}
              {filteredConversations
                .filter((conv) => conv.partner?.id !== adminUserId)
                .map((conv) => (
                  <div 
                    key={conv.partner?.id} 
                    onClick={() => handleConversationSelect(conv.partner?.id)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      selectedConversation === conv.partner?.id ? 'border-l-4 border-bank-blue-600 bg-bank-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getUserInitials(conv.partner?.firstName, conv.partner?.lastName)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {conv.partner?.firstName} {conv.partner?.lastName}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {conv.lastMessage ? conv.lastMessage.substring(0, 40) + (conv.lastMessage.length > 40 ? "..." : "") : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {conv.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">SB</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">SecureBank Support</p>
                      <p className="text-sm text-green-600">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isUserMessage = message.senderId === user?.id;
                        return (
                      <div 
                        key={message.id} 
                            className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                      >
                            {!isUserMessage && (
                              <div className="flex-shrink-0 mr-2">
                                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">SB</span>
                                </div>
                          </div>
                        )}
                        
                            <div className="max-w-[70%]">
                          <div 
                            className={`rounded-lg px-4 py-2 ${
                                  isUserMessage 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                            }`}
                          >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                              <div className={`flex items-center mt-1 ${
                                isUserMessage ? 'justify-end' : 'justify-start'
                              }`}>
                                <p className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                                {isUserMessage && message.isRead && (
                                  <CheckCheck className="w-3 h-3 text-blue-500 ml-1" />
                                )}
                              </div>
                        </div>

                            {isUserMessage && user && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {getUserInitials(user.firstName, user.lastName)}
                            </span>
                                </div>
                          </div>
                        )}
                      </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 bg-white"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Your messages</h3>
                  <p className="text-gray-500 mt-1">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
