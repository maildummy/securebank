import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MessagingInterface from "@/components/messaging-interface";
import { 
  Bell, 
  CreditCard, 
  ArrowRightLeft, 
  History, 
  MessageSquare, 
  User, 
  Home,
  DollarSign,
  PiggyBank,
  Plus,
  Minus,
  ShoppingCart,
  X
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const [showMessaging, setShowMessaging] = useState(false);
  const [showAccountReviewBanner, setShowAccountReviewBanner] = useState(true);

  // Mock data for transactions
  const mockTransactions = [
    {
      id: 1,
      description: "Direct Deposit - Salary",
      amount: 3250.00,
      date: "Dec 15, 2024",
      type: "credit",
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      status: "Completed"
    },
    {
      id: 2,
      description: "Rent Payment",
      amount: -1200.00,
      date: "Dec 12, 2024",
      type: "debit",
      icon: Minus,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      status: "Completed"
    },
    {
      id: 3,
      description: "Online Purchase - Amazon",
      amount: -89.99,
      date: "Dec 10, 2024",
      type: "debit",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      status: "Completed"
    }
  ];

  if (!user) {
    setLocation("/");
    return null;
  }

  if (user.isAdmin) {
    setLocation("/admin");
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-bank-blue-700">SecureBank</span>
              <span className="ml-4 text-gray-600">|</span>
              <span className="ml-4 text-gray-700">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-bank-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserInitials(user.firstName, user.lastName)}
                  </span>
                </div>
                <span className="text-gray-700">{user.firstName} {user.lastName}</span>
              </div>
              <Button onClick={handleLogout} variant="ghost" className="text-gray-600 hover:text-gray-900">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Account Status Banner */}
      {user.status === "pending" && showAccountReviewBanner && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Your account is currently under review. You can still access your dashboard and messaging, 
                  but some features may be limited until approval is complete.
                </p>
              </div>
              <div className="ml-auto">
                <button 
                  onClick={() => setShowAccountReviewBanner(false)}
                  className="text-yellow-800 hover:text-yellow-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-bank-blue-700 bg-bank-blue-50 rounded-lg font-medium">
                    <Home className="w-5 h-5 mr-3" />
                    Overview
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 mr-3" />
                    Accounts
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <ArrowRightLeft className="w-5 h-5 mr-3" />
                    Transfers
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <History className="w-5 h-5 mr-3" />
                    Transactions
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setShowMessaging(true)}
                    className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Messages
                    <Badge variant="destructive" className="ml-auto">3</Badge>
                  </button>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Account Balance Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Balance</p>
                      <p className="text-3xl font-bold text-gray-900">$12,486.43</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">+2.5%</span>
                    <span className="text-gray-600 ml-2">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Savings Account</p>
                      <p className="text-3xl font-bold text-gray-900">$8,234.12</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-blue-600 font-medium">+1.2% APY</span>
                    <span className="text-gray-600 ml-2">interest rate</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((transaction) => {
                    const Icon = transaction.icon;
                    return (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${transaction.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                            <Icon className={`w-5 h-5 ${transaction.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full text-bank-blue-600 hover:text-bank-blue-700 border-bank-blue-200 hover:bg-bank-blue-50"
                  >
                    View All Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MessagingInterface 
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
      />
    </div>
  );
}
