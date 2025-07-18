import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Search } from "lucide-react";

interface MessagingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagingInterface({ isOpen, onClose }: MessagingInterfaceProps) {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/user/conversations"],
    enabled: isOpen && !!sessionId,
    meta: { sessionId },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", selectedConversation],
    enabled: isOpen && !!selectedConversation && !!sessionId,
    meta: { sessionId },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; content: string }) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId || "",
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/conversations"] });
      setNewMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "SB";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Get admin user for new conversations (simplified for demo)
  const adminUserId = 1; // Assuming admin has ID 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-5/6 flex flex-col p-0">
        {/* Messaging Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
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
                />
              </div>
            </div>
            <div className="space-y-1">
              {/* Default admin conversation */}
              <div 
                onClick={() => setSelectedConversation(adminUserId)}
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
                      <p className="text-xs text-gray-600">
                        {messages.length > 0 ? messages[messages.length - 1]?.content?.substring(0, 40) + "..." : "Start a conversation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {messages.length > 0 
                        ? new Date(messages[messages.length - 1]?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ""
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200">
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
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((message: any) => (
                      <div 
                        key={message.id} 
                        className={`flex items-start ${
                          message.senderId === user?.id ? 'justify-end' : ''
                        }`}
                      >
                        {message.senderId !== user?.id && (
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-medium">SB</span>
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-col items-end max-w-xs">
                          <div 
                            className={`rounded-lg px-4 py-2 ${
                              message.senderId === user?.id 
                                ? 'bg-bank-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {message.senderId === user?.id && (
                          <div className="w-8 h-8 bg-bank-blue-600 rounded-full flex items-center justify-center ml-3">
                            <span className="text-white text-xs font-medium">
                              {getUserInitials(user.firstName, user.lastName)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="bg-bank-blue-600 hover:bg-bank-blue-700"
                    >
                      {sendMessageMutation.isPending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
