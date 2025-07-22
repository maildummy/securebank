import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { PasswordStrength } from "@/components/ui/password-strength";
import { CountrySelect } from "@/components/ui/country-select";
import { ForgotPassword } from "@/components/ui/forgot-password";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";

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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
  mode?: "signin" | "signup";
  onModeChange?: React.Dispatch<React.SetStateAction<"signin" | "signup">>;
}

// Define the form schemas
const signinSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SigninFormValues = z.infer<typeof signinSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthModal({ isOpen, onClose, defaultTab = "signin", mode, onModeChange }: AuthModalProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminLoginAttemptId, setAdminLoginAttemptId] = useState<string | null>(null);
  const [adminLoginStatus, setAdminLoginStatus] = useState<string | null>(null);
  const [adminLoginCheckInterval, setAdminLoginCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  // State for forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signUp, checkAdminLoginStatus } = useAuth();
  const { toast } = useToast();
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Use mode from props if provided
  useEffect(() => {
    if (mode) {
      setActiveTab(mode);
    }
  }, [mode]);

  // Handle tab change
  const handleTabChange = (value: "signin" | "signup") => {
    setActiveTab(value);
    if (onModeChange) {
      onModeChange(value);
    }
  };

  useEffect(() => {
    // Clean up interval when component unmounts
    return () => {
      if (adminLoginCheckInterval) {
        clearInterval(adminLoginCheckInterval);
      }
    };
  }, [adminLoginCheckInterval]);

  // Sign in form
  const signinForm = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  // Sign up form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      termsAccepted: false,
    },
    mode: "onChange",
  });

  const onSigninSubmit = async (data: SigninFormValues) => {
    try {
      const result = await signIn(data);
      
      // Check if this is an admin login that requires approval
      if (result && result.requiresApproval && result.attemptId) {
        setAdminLoginAttemptId(result.attemptId);
        setAdminLoginStatus("pending");
        
        // Start polling for approval status
        const interval = setInterval(async () => {
          try {
            const statusResult = await checkAdminLoginStatus(result.attemptId);
            
            if (statusResult.status === "approved") {
              clearInterval(interval);
              setAdminLoginStatus("approved");
              toast({
                title: "Login approved",
                description: "Your admin login has been approved.",
              });
              onClose();
            } else if (statusResult.status === "denied") {
              clearInterval(interval);
              setAdminLoginStatus("denied");
              toast({
                title: "Login denied",
                description: "Your admin login attempt was denied.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error checking login status", error);
          }
        }, 5000); // Check every 5 seconds
        
        setAdminLoginCheckInterval(interval);
      } else {
        // Regular login successful
      toast({
        title: "Welcome back!",
          description: "You have successfully signed in.",
      });
      onClose();
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      await signUp(data);
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      onClose();
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
            <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {showForgotPassword ? "Forgot Password" : (activeTab === "signin" ? "Welcome Back" : "Create Account")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showForgotPassword 
              ? "Enter your details to reset your password" 
              : (activeTab === "signin" 
                  ? "Sign in to access your secure banking account" 
                  : "Join SecureBank for a better banking experience")}
          </DialogDescription>
            </DialogHeader>

        {adminLoginAttemptId && adminLoginStatus === "pending" ? (
          <div className="p-6 flex flex-col items-center text-center">
            <ShieldAlert className="h-16 w-16 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Admin Login Approval Required</h3>
            <p className="text-gray-600 mb-4">
              For security reasons, your admin login attempt requires approval. Please wait while your request is being reviewed.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full w-1/3 animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">This may take a few moments...</p>
          </div>
        ) : adminLoginStatus === "denied" ? (
          <div className="p-6 flex flex-col items-center text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Login Denied</h3>
            <p className="text-gray-600 mb-4">
              Your admin login attempt was denied. Please try again or contact another administrator for assistance.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : (
          <div className="px-6 pb-6" ref={formContainerRef}>
            {showForgotPassword ? (
              <ForgotPassword onClose={() => setShowForgotPassword(false)} />
            ) : (
              <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as "signin" | "signup")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <Form {...signinForm}>
                    <form onSubmit={signinForm.handleSubmit(onSigninSubmit)} className="space-y-4">
                      <div className="space-y-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  placeholder="Enter your email or username"
                          {...signinForm.register("identifier")}
                />
                        {signinForm.formState.errors.identifier && (
                          <p className="text-sm text-red-500">{signinForm.formState.errors.identifier.message}</p>
                )}
              </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                        </div>
                        <div className="relative">
                <Input
                  id="password"
                            type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                            {...signinForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {signinForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{signinForm.formState.errors.password.message}</p>
                        )}
                        <button 
                          type="button" 
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 text-right w-full"
                        >
                          Forgot password? Click here
                        </button>
              </div>

                <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          {...signinForm.register("rememberMe")}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
              </div>

              <Button 
                type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={signinForm.formState.isSubmitting}
              >
                        {signinForm.formState.isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign In
              </Button>
            </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <ScrollArea className="h-[60vh] pr-4">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={signupForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
              </div>

                        <FormField
                          control={signupForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="johndoe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <CountrySelect value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={signupForm.control}
                            name="city"
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
                            control={signupForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="NY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="10001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                </div>

                        <FormField
                          control={signupForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px]">
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
                        
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                  <Input
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="Create a password" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </FormControl>
                            <PasswordStrength password={field.value} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                <Input
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="Confirm your password" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                  I agree to the{" "}
                                <a href="#" className="text-primary underline">
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-primary underline">
                                  Privacy Policy
                                </a>
                              </FormLabel>
                              <FormMessage />
              </div>
                          </FormItem>
                        )}
                      />
                        <Button type="submit" className="w-full" disabled={signupForm.formState.isSubmitting}>
                          {signupForm.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
              </Button>
            </form>
                    </Form>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}