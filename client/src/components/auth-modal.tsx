import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { signInSchema, signUpSchema, type SignInData, type SignUpData } from "@shared/schema";
import { X } from "lucide-react";
import PasswordStrength from "@/components/ui/password-strength";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const handleSignIn = async (data: SignInData) => {
    try {
      await signIn(data);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      onClose();
      // Navigation will be handled by the auth context
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    try {
      await signUp(data);
      toast({
        title: "Account created!",
        description: "Your account has been created and is under review.",
      });
      onClose();
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {mode === "signin" ? (
          <div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
              <p className="text-gray-600 text-center">Sign in to your SecureBank account</p>
            </DialogHeader>

            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  placeholder="Enter your email or username"
                  {...signInForm.register("identifier")}
                />
                {signInForm.formState.errors.identifier && (
                  <p className="text-sm text-red-600">{signInForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...signInForm.register("password")}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">Remember me</Label>
                </div>
                <a href="#" className="text-sm text-bank-blue-600 hover:text-bank-blue-700">
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-bank-blue-600 hover:bg-bank-blue-700"
                disabled={signInForm.formState.isSubmitting}
              >
                {signInForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => onModeChange("signup")}
                  className="text-bank-blue-600 font-semibold hover:text-bank-blue-700"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Create Account</DialogTitle>
              <p className="text-gray-600 text-center">Join SecureBank and start banking securely</p>
            </DialogHeader>

            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...signUpForm.register("firstName")}
                  />
                  {signUpForm.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...signUpForm.register("lastName")}
                  />
                  {signUpForm.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...signUpForm.register("email")}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...signUpForm.register("username")}
                />
                {signUpForm.formState.errors.username && (
                  <p className="text-sm text-red-600">{signUpForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  {...signUpForm.register("password")}
                />
                <PasswordStrength password={signUpForm.watch("password")} />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...signUpForm.register("confirmPassword")}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...signUpForm.register("phone")}
                />
                {signUpForm.formState.errors.phone && (
                  <p className="text-sm text-red-600">{signUpForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <a href="#" className="text-bank-blue-600 hover:text-bank-blue-700">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-bank-blue-600 hover:text-bank-blue-700">Privacy Policy</a>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-bank-blue-600 hover:bg-bank-blue-700"
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => onModeChange("signin")}
                  className="text-bank-blue-600 font-semibold hover:text-bank-blue-700"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
