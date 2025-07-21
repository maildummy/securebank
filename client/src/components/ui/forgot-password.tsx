import { useState } from "react";
import { z } from "zod";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useToast } from "@/hooks/use-toast";
import { CountrySelect } from "./country-select";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

interface ForgotPasswordProps {
  onClose: () => void;
}

export function ForgotPassword({ onClose }: ForgotPasswordProps) {
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = forgotPasswordSchema.parse({
        identifier,
        phone,
        dateOfBirth,
      });
      
      setIsLoading(true);
      
      // Call API to verify user
      const response = await fetch("/api/auth/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "User verification failed");
      }
      
      // If successful, move to reset step
      setStep("reset");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("User not found. Please check your information.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = resetPasswordSchema.parse({ newPassword });
      
      setIsLoading(true);
      
      // Call API to reset password
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          phone,
          dateOfBirth,
          newPassword: result.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }
      
      // Show success message and close dialog
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Password reset failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "verify" ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Username</Label>
            <Input
              id="identifier"
              placeholder="Enter your email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <CountrySelect 
              value={phone}
              onChange={setPhone}
              placeholder="Select country and enter number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setStep("verify")}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 