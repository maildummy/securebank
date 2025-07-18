import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { 
  Clock, 
  Users, 
  Mail, 
  TrendingUp
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!sessionId,
    meta: { sessionId },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!sessionId,
    meta: { sessionId },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status, message }: { userId: number; status: string; message?: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId || "",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "suspended":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-bank-blue-700">SecureBank</span>
              <span className="ml-4 text-gray-600">|</span>
              <span className="ml-4 text-gray-700 font-medium">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AD</span>
                </div>
                <span className="text-gray-700">Admin User</span>
              </div>
              <Button onClick={handleLogout} variant="ghost" className="text-gray-600 hover:text-gray-900">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.unreadMessages || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeToday || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="flex items-center space-x-4">
                <Input 
                  placeholder="Search users..." 
                  className="w-64"
                />
                <Select>
                  <SelectTrigger className="w-40">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-bank-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getUserInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleApprove(user.id)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(user.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900 mr-2"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {user.status === "approved" && (
                        <Button
                          onClick={() => handleSuspend(user.id)}
                          variant="ghost"
                          size="sm"
                          className="text-yellow-600 hover:text-yellow-900 mr-2"
                        >
                          Suspend
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of{" "}
                <span className="font-medium">{users.length}</span> results
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm" className="bg-bank-blue-600 text-white">1</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
