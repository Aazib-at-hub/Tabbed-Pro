import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import logoSrc from "@/assets/logo.png";

export default function ForgotPassword() {
  const { requestPasswordReset, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch {
      toast.error("Failed to process request. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img
              src={logoSrc}
              alt="Tabbed logo"
              className="size-10 rounded-xl shadow-[0_0_24px_-4px_var(--primary)]"
            />
            <span className="font-display text-2xl font-bold tracking-tight">
              Tabb<span className="text-primary">ed</span>{" "}
              <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
                Pro
              </span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">Account Recovery</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-border/60 glass-panel shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="font-display text-xl font-semibold">
              Reset your password
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Check your inbox</h3>
                  <p className="text-xs text-muted-foreground">
                    We sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs"
                >
                  Didn&apos;t receive email? Try again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full font-medium" disabled={isLoading}>
                  {isLoading ? "Sending Link..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/40 pt-4 text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
