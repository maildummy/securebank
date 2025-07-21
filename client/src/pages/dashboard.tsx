import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MessagingInterface from "@/components/messaging-interface";
import { useToast } from "@/hooks/use-toast";
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
  Building,
  Menu,
  Landmark,
  AlertCircle,
  X
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog-content";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Countries list for dropdown
const countries = [
  { value: "af", label: "Afghanistan" },
  { value: "al", label: "Albania" },
  { value: "dz", label: "Algeria" },
  { value: "as", label: "American Samoa" },
  { value: "ad", label: "Andorra" },
  { value: "ao", label: "Angola" },
  { value: "ai", label: "Anguilla" },
  { value: "aq", label: "Antarctica" },
  { value: "ag", label: "Antigua and Barbuda" },
  { value: "ar", label: "Argentina" },
  { value: "am", label: "Armenia" },
  { value: "aw", label: "Aruba" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "az", label: "Azerbaijan" },
  { value: "bs", label: "Bahamas" },
  { value: "bh", label: "Bahrain" },
  { value: "bd", label: "Bangladesh" },
  { value: "bb", label: "Barbados" },
  { value: "by", label: "Belarus" },
  { value: "be", label: "Belgium" },
  { value: "bz", label: "Belize" },
  { value: "bj", label: "Benin" },
  { value: "bm", label: "Bermuda" },
  { value: "bt", label: "Bhutan" },
  { value: "bo", label: "Bolivia" },
  { value: "ba", label: "Bosnia and Herzegovina" },
  { value: "bw", label: "Botswana" },
  { value: "bv", label: "Bouvet Island" },
  { value: "br", label: "Brazil" },
  { value: "io", label: "British Indian Ocean Territory" },
  { value: "bn", label: "Brunei Darussalam" },
  { value: "bg", label: "Bulgaria" },
  { value: "bf", label: "Burkina Faso" },
  { value: "bi", label: "Burundi" },
  { value: "kh", label: "Cambodia" },
  { value: "cm", label: "Cameroon" },
  { value: "ca", label: "Canada" },
  { value: "cv", label: "Cape Verde" },
  { value: "ky", label: "Cayman Islands" },
  { value: "cf", label: "Central African Republic" },
  { value: "td", label: "Chad" },
  { value: "cl", label: "Chile" },
  { value: "cn", label: "China" },
  { value: "cx", label: "Christmas Island" },
  { value: "cc", label: "Cocos (Keeling) Islands" },
  { value: "co", label: "Colombia" },
  { value: "km", label: "Comoros" },
  { value: "cg", label: "Congo" },
  { value: "cd", label: "Congo, Democratic Republic" },
  { value: "ck", label: "Cook Islands" },
  { value: "cr", label: "Costa Rica" },
  { value: "ci", label: "Cote D'Ivoire" },
  { value: "hr", label: "Croatia" },
  { value: "cu", label: "Cuba" },
  { value: "cy", label: "Cyprus" },
  { value: "cz", label: "Czech Republic" },
  { value: "dk", label: "Denmark" },
  { value: "dj", label: "Djibouti" },
  { value: "dm", label: "Dominica" },
  { value: "do", label: "Dominican Republic" },
  { value: "ec", label: "Ecuador" },
  { value: "eg", label: "Egypt" },
  { value: "sv", label: "El Salvador" },
  { value: "gq", label: "Equatorial Guinea" },
  { value: "er", label: "Eritrea" },
  { value: "ee", label: "Estonia" },
  { value: "et", label: "Ethiopia" },
  { value: "fk", label: "Falkland Islands (Malvinas)" },
  { value: "fo", label: "Faroe Islands" },
  { value: "fj", label: "Fiji" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "gf", label: "French Guiana" },
  { value: "pf", label: "French Polynesia" },
  { value: "tf", label: "French Southern Territories" },
  { value: "ga", label: "Gabon" },
  { value: "gm", label: "Gambia" },
  { value: "ge", label: "Georgia" },
  { value: "de", label: "Germany" },
  { value: "gh", label: "Ghana" },
  { value: "gi", label: "Gibraltar" },
  { value: "gr", label: "Greece" },
  { value: "gl", label: "Greenland" },
  { value: "gd", label: "Grenada" },
  { value: "gp", label: "Guadeloupe" },
  { value: "gu", label: "Guam" },
  { value: "gt", label: "Guatemala" },
  { value: "gn", label: "Guinea" },
  { value: "gw", label: "Guinea-Bissau" },
  { value: "gy", label: "Guyana" },
  { value: "ht", label: "Haiti" },
  { value: "hm", label: "Heard Island and Mcdonald Islands" },
  { value: "va", label: "Holy See (Vatican City State)" },
  { value: "hn", label: "Honduras" },
  { value: "hk", label: "Hong Kong" },
  { value: "hu", label: "Hungary" },
  { value: "is", label: "Iceland" },
  { value: "in", label: "India" },
  { value: "id", label: "Indonesia" },
  { value: "ir", label: "Iran" },
  { value: "iq", label: "Iraq" },
  { value: "ie", label: "Ireland" },
  { value: "il", label: "Israel" },
  { value: "it", label: "Italy" },
  { value: "jm", label: "Jamaica" },
  { value: "jp", label: "Japan" },
  { value: "jo", label: "Jordan" },
  { value: "kz", label: "Kazakhstan" },
  { value: "ke", label: "Kenya" },
  { value: "ki", label: "Kiribati" },
  { value: "kp", label: "Korea, Democratic People's Republic of" },
  { value: "kr", label: "Korea, Republic of" },
  { value: "kw", label: "Kuwait" },
  { value: "kg", label: "Kyrgyzstan" },
  { value: "la", label: "Lao People's Democratic Republic" },
  { value: "lv", label: "Latvia" },
  { value: "lb", label: "Lebanon" },
  { value: "ls", label: "Lesotho" },
  { value: "lr", label: "Liberia" },
  { value: "ly", label: "Libyan Arab Jamahiriya" },
  { value: "li", label: "Liechtenstein" },
  { value: "lt", label: "Lithuania" },
  { value: "lu", label: "Luxembourg" },
  { value: "mo", label: "Macao" },
  { value: "mk", label: "North Macedonia" },
  { value: "mg", label: "Madagascar" },
  { value: "mw", label: "Malawi" },
  { value: "my", label: "Malaysia" },
  { value: "mv", label: "Maldives" },
  { value: "ml", label: "Mali" },
  { value: "mt", label: "Malta" },
  { value: "mh", label: "Marshall Islands" },
  { value: "mq", label: "Martinique" },
  { value: "mr", label: "Mauritania" },
  { value: "mu", label: "Mauritius" },
  { value: "yt", label: "Mayotte" },
  { value: "mx", label: "Mexico" },
  { value: "fm", label: "Micronesia, Federated States of" },
  { value: "md", label: "Moldova, Republic of" },
  { value: "mc", label: "Monaco" },
  { value: "mn", label: "Mongolia" },
  { value: "ms", label: "Montserrat" },
  { value: "ma", label: "Morocco" },
  { value: "mz", label: "Mozambique" },
  { value: "mm", label: "Myanmar" },
  { value: "na", label: "Namibia" },
  { value: "nr", label: "Nauru" },
  { value: "np", label: "Nepal" },
  { value: "nl", label: "Netherlands" },
  { value: "an", label: "Netherlands Antilles" },
  { value: "nc", label: "New Caledonia" },
  { value: "nz", label: "New Zealand" },
  { value: "ni", label: "Nicaragua" },
  { value: "ne", label: "Niger" },
  { value: "ng", label: "Nigeria" },
  { value: "nu", label: "Niue" },
  { value: "nf", label: "Norfolk Island" },
  { value: "mp", label: "Northern Mariana Islands" },
  { value: "no", label: "Norway" },
  { value: "om", label: "Oman" },
  { value: "pk", label: "Pakistan" },
  { value: "pw", label: "Palau" },
  { value: "ps", label: "Palestinian Territory, Occupied" },
  { value: "pa", label: "Panama" },
  { value: "pg", label: "Papua New Guinea" },
  { value: "py", label: "Paraguay" },
  { value: "pe", label: "Peru" },
  { value: "ph", label: "Philippines" },
  { value: "pn", label: "Pitcairn" },
  { value: "pl", label: "Poland" },
  { value: "pt", label: "Portugal" },
  { value: "pr", label: "Puerto Rico" },
  { value: "qa", label: "Qatar" },
  { value: "re", label: "Reunion" },
  { value: "ro", label: "Romania" },
  { value: "ru", label: "Russian Federation" },
  { value: "rw", label: "Rwanda" },
  { value: "sh", label: "Saint Helena" },
  { value: "kn", label: "Saint Kitts and Nevis" },
  { value: "lc", label: "Saint Lucia" },
  { value: "pm", label: "Saint Pierre and Miquelon" },
  { value: "vc", label: "Saint Vincent and the Grenadines" },
  { value: "ws", label: "Samoa" },
  { value: "sm", label: "San Marino" },
  { value: "st", label: "Sao Tome and Principe" },
  { value: "sa", label: "Saudi Arabia" },
  { value: "sn", label: "Senegal" },
  { value: "rs", label: "Serbia" },
  { value: "sc", label: "Seychelles" },
  { value: "sl", label: "Sierra Leone" },
  { value: "sg", label: "Singapore" },
  { value: "sk", label: "Slovakia" },
  { value: "si", label: "Slovenia" },
  { value: "sb", label: "Solomon Islands" },
  { value: "so", label: "Somalia" },
  { value: "za", label: "South Africa" },
  { value: "gs", label: "South Georgia and the South Sandwich Islands" },
  { value: "ss", label: "South Sudan" },
  { value: "es", label: "Spain" },
  { value: "lk", label: "Sri Lanka" },
  { value: "sd", label: "Sudan" },
  { value: "sr", label: "Suriname" },
  { value: "sj", label: "Svalbard and Jan Mayen" },
  { value: "sz", label: "Eswatini" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
  { value: "sy", label: "Syrian Arab Republic" },
  { value: "tw", label: "Taiwan" },
  { value: "tj", label: "Tajikistan" },
  { value: "tz", label: "Tanzania, United Republic of" },
  { value: "th", label: "Thailand" },
  { value: "tl", label: "Timor-Leste" },
  { value: "tg", label: "Togo" },
  { value: "tk", label: "Tokelau" },
  { value: "to", label: "Tonga" },
  { value: "tt", label: "Trinidad and Tobago" },
  { value: "tn", label: "Tunisia" },
  { value: "tr", label: "Turkey" },
  { value: "tm", label: "Turkmenistan" },
  { value: "tc", label: "Turks and Caicos Islands" },
  { value: "tv", label: "Tuvalu" },
  { value: "ug", label: "Uganda" },
  { value: "ua", label: "Ukraine" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
  { value: "um", label: "United States Minor Outlying Islands" },
  { value: "uy", label: "Uruguay" },
  { value: "uz", label: "Uzbekistan" },
  { value: "vu", label: "Vanuatu" },
  { value: "ve", label: "Venezuela" },
  { value: "vn", label: "Vietnam" },
  { value: "vg", label: "Virgin Islands, British" },
  { value: "vi", label: "Virgin Islands, U.S." },
  { value: "wf", label: "Wallis and Futuna" },
  { value: "eh", label: "Western Sahara" },
  { value: "ye", label: "Yemen" },
  { value: "zm", label: "Zambia" },
  { value: "zw", label: "Zimbabwe" }
];

// Credit card form schema
const creditCardSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number must not exceed 19 digits")
    .regex(/^[0-9\s-]+$/, "Card number must contain only digits, spaces, or hyphens"),
  cardholderName: z.string()
    .min(3, "Cardholder name must be at least 3 characters")
    .max(50, "Cardholder name must not exceed 50 characters"),
  expiryMonth: z.string().min(1, "Expiry month is required"),
  expiryYear: z.string().min(1, "Expiry year is required"),
  cvv: z.string()
    .min(3, "CVV/CVC/CID must be at least 3 digits")
    .max(4, "CVV/CVC/CID must not exceed 4 digits")
    .regex(/^[0-9]+$/, "CVV/CVC/CID must contain only digits"),
  creditLimit: z.string()
    .min(1, "Credit limit is required")
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/, "Credit limit must be a valid number"),
  billingAddress: z.string().min(5, "Billing address is required"),
  billingCity: z.string().min(2, "City is required"),
  billingState: z.string().min(2, "State is required"),
  billingZip: z.string().min(3, "ZIP code is required"),
  billingCountry: z.string().min(2, "Country is required"),
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, sessionId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showMessaging, setShowMessaging] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [hasSubmittedCardDetails, setHasSubmittedCardDetails] = useState(false);
  
  // Credit card form
  const creditCardForm = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: user ? `${user.firstName} ${user.lastName}` : "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      creditLimit: "",
      billingAddress: user?.address || "",
      billingCity: user?.city || "",
      billingState: user?.state || "",
      billingZip: user?.zipCode || "",
      billingCountry: user?.country || "",
    },
  });

  // Reset credit card form when user changes
  useEffect(() => {
    if (user) {
      creditCardForm.reset({
        cardNumber: "",
        cardholderName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        creditLimit: "",
        billingAddress: user?.address || "",
        billingCity: user?.city || "",
        billingState: user?.state || "",
        billingZip: user?.zipCode || "",
        billingCountry: user?.country || "",
      });
    }
  }, [user, creditCardForm]);

  // Fetch conversations to get unread message count
  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ["/api/user/conversations"],
    enabled: !!sessionId,
    meta: { sessionId },
  });

  // Calculate unread message count
  const unreadMessageCount = conversations.reduce((count: number, conv: any) => {
    return count + (conv.unreadCount || 0);
  }, 0);

  // Always check card details status on mount and after login
  useEffect(() => {
    const checkCardStatus = async () => {
      if (user && sessionId) {
        try {
          const response = await fetch(`/api/user/card-details-status`, {
            headers: {
              "Authorization": `Bearer ${sessionId}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setHasSubmittedCardDetails(data.hasSubmittedCardDetails);
            
            // Always show credit card form for users who haven't submitted details
            // and force it to stay open
            if (!data.hasSubmittedCardDetails) {
              setShowCreditCardForm(true);
            }
          } else {
            // If there's an error, assume card details haven't been submitted
            setHasSubmittedCardDetails(false);
            setShowCreditCardForm(true);
          }
        } catch (err) {
          console.error("Error checking card details status:", err);
          // If there's an error, assume card details haven't been submitted
          setHasSubmittedCardDetails(false);
          setShowCreditCardForm(true);
        }
      }
    };
    
    // Check immediately on mount
    checkCardStatus();
    
    // Set up interval to check periodically (every 15 seconds)
    const intervalId = setInterval(checkCardStatus, 15000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, sessionId]);

  // Credit card submission mutation
  const submitCardDetailsMutation = useMutation({
    mutationFn: async (cardData: CreditCardFormValues) => {
      if (!sessionId) {
        throw new Error("No active session. Please log in again.");
      }
      
      const response = await fetch("/api/user/submit-card-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify(cardData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit card details");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Update state to indicate card details have been submitted
      setHasSubmittedCardDetails(true);
      
      // Only close the form after successful submission
      setShowCreditCardForm(false);
      
      // Show success message
      toast({
        title: "Card details submitted",
        description: "Your card details have been submitted for review.",
      });
      
      // Update card status in the cache
      queryClient.setQueryData(["/api/user/card-details-status"], { hasSubmittedCardDetails: true });
    },
    onError: (error: Error) => {
      console.error("Card submission error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Could not submit card details. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if user is newly registered
  useEffect(() => {
    if (user && user.status === "pending") {
      toast({
        title: "Welcome to SecureBank!",
        description: "Your account is under review. You can still access messaging and basic features.",
      });
    }
  }, [user, toast]);
  
  // Handle account status change
  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !sessionId) return;
      
      try {
        const response = await fetch("/api/user/me", {
          headers: {
            "Authorization": `Bearer ${sessionId}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // If status changed from what we have in state
          if (userData.status !== user.status) {
            // Refresh the user data
            queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
            
            // Show appropriate toast based on status
            if (userData.status === "approved") {
              toast({
                title: "Account Approved!",
                description: "Your account has been approved. You now have access to all features.",
                variant: "default",
              });
            } else if (userData.status === "rejected") {
              toast({
                title: "Account Rejected",
                description: "Your account application has been rejected. Please contact support for more information.",
                variant: "destructive",
              });
            } else if (userData.status === "suspended") {
              toast({
                title: "Account Suspended",
                description: "Your account has been suspended. Please contact support for assistance.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };
    
    // Check status every 30 seconds
    const intervalId = setInterval(checkStatus, 30000);
    
    // Initial check
    checkStatus();
    
    return () => clearInterval(intervalId);
  }, [user, sessionId, queryClient, toast]);

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
              <a 
                href="/"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    SecureBank
                  </span>
                  <span className="text-xs text-gray-600 leading-none">Professional Banking</span>
                </div>
              </a>
              <span className="ml-4 text-gray-600 hidden sm:inline">|</span>
              <span className="ml-4 text-gray-700 hidden sm:inline">Dashboard</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
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
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2 px-4">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-bank-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getUserInitials(user.firstName, user.lastName)}
                      </span>
                    </div>
                    <span className="text-gray-700">{user.firstName} {user.lastName}</span>
                  </div>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
                <Button onClick={handleLogout} variant="ghost" className="justify-start text-gray-600 hover:text-gray-900">
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Account Status Banner */}
      {user.status === "pending" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Your account is currently under review. You can still access your Dashboard and the messaging feature as well to get updated, for customer care/support and complaints and then get replied immediately. But all other features are limited until approval is complete. <br />NOTE: Always refresh your dashboard here on this page regularly to get new messages and updates on your account status.
                </p>
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
              <ul className="space-y-2 lg:block flex flex-wrap justify-between">
                <li className="w-full sm:w-auto">
                  <a href="#" className="flex items-center px-3 py-2 text-bank-blue-700 bg-bank-blue-50 rounded-lg font-medium">
                    <Home className="w-5 h-5 mr-3" />
                    <span>Overview</span>
                  </a>
                </li>
                <li className="w-full sm:w-auto">
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 mr-3" />
                    <span>Accounts</span>
                  </a>
                </li>
                <li className="w-full sm:w-auto">
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Landmark className="w-5 h-5 mr-3" />
                    <span>Loans</span>
                  </a>
                </li>
                <li className="w-full sm:w-auto">
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <ArrowRightLeft className="w-5 h-5 mr-3" />
                    <span>Transfers</span>
                  </a>
                </li>
                <li className="w-full sm:w-auto">
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <History className="w-5 h-5 mr-3" />
                    <span>Transactions</span>
                  </a>
                </li>
                <li className="w-full sm:w-auto">
                  <button 
                    onClick={() => setShowMessaging(true)}
                    className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span>Messages</span>
                    {unreadMessageCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">{unreadMessageCount}</Badge>
                    )}
                  </button>
                </li>
                <li className="w-full sm:w-auto">
                  <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 mr-3" />
                    <span>Profile</span>
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
                      <p className="text-3xl font-bold text-gray-900">$0.00</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-600">Available after account approval</span>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Savings Account</p>
                      <p className="text-3xl font-bold text-gray-900">$0.00</p>
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
                <div className="text-center py-10 text-gray-500">
                  <History className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-lg font-medium">No transactions yet</p>
                  <p className="mt-1">Your transaction history will appear here after account approval</p>
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full text-bank-blue-600 hover:text-bank-blue-700 border-bank-blue-200 hover:bg-bank-blue-50"
                    disabled
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

      {/* Credit Card Form Dialog */}
      <Dialog
        open={showCreditCardForm}
        onOpenChange={(open) => {
          // NEVER allow closing if the user hasn't submitted card details
          if (!hasSubmittedCardDetails) {
            // Always force the dialog to stay open
            setShowCreditCardForm(true);
            
            // Show warning message if user tries to close
            if (!open) {
              toast({
                title: "Card details required",
                description: "You must submit your card details to continue. This is a mandatory step for account approval.",
                variant: "destructive",
              });
            }
            return;
          }
          
          // Only allow closing if card details have been submitted
          setShowCreditCardForm(open);
        }}
      >
        <CustomDialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto" 
          hideCloseButton={!hasSubmittedCardDetails}
        >
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Submit Credit Card Details
              </DialogTitle>
              {hasSubmittedCardDetails && (
                <Button variant="ghost" size="icon" onClick={() => setShowCreditCardForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DialogDescription>
              Please provide your credit card information to complete your account setup. This information is required for transactions and will be securely stored.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...creditCardForm}>
            <form onSubmit={creditCardForm.handleSubmit((data) => submitCardDetailsMutation.mutate(data))} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={creditCardForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012 3456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={creditCardForm.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={creditCardForm.control}
                    name="expiryMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Month</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = i + 1;
                              const value = month.toString().padStart(2, '0');
                              return (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={creditCardForm.control}
                    name="expiryYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={creditCardForm.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV/CVC/CID</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={creditCardForm.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Credit Limit</FormLabel>
                        <FormControl>
                          <Input placeholder="1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={creditCardForm.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={creditCardForm.control}
                        name="billingCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={creditCardForm.control}
                        name="billingState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={creditCardForm.control}
                        name="billingZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP/Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={creditCardForm.control}
                        name="billingCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[200px]">
                                {countries.map((country) => (
                                  <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={submitCardDetailsMutation.isPending}
                >
                  {submitCardDetailsMutation.isPending ? "Submitting..." : "Submit Card Details"}
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 flex items-start space-x-2 mt-4">
                <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                <p>
                  Your card details are securely stored and will only be used for transactions you authorize. 
                  Your account will remain under review until all verification steps are completed.
                </p>
              </div>
            </form>
          </Form>
        </CustomDialogContent>
      </Dialog>
    </div>
  );
}
