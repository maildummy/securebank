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
                        {/* Form fields here */}
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