import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, Check, ShieldCheck } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import logoSrc from "@/assets/logo.png";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-muted" };
    if (pwd.length < 6) return { score: 1, label: "Weak", color: "bg-destructive" };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { score: 3, label: "Strong", color: "bg-emerald-500" };
    }
    return { score: 2, label: "Fair", color: "bg-amber-500" };
  };

  const pwdStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!agreed) {
      toast.error("You must accept the Terms of Service to continue.");
      return;
    }

    try {
      const success = await signup(name, email, password);
      if (success) {
        toast.success("Account created! Please verify your email.");
        navigate("/verify-email", { replace: true });
      }
    } catch {
      toast.error("Signup failed. Please try again.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success("Account created via Google!");
        navigate("/onboarding", { replace: true });
      }
    } catch {
      toast.error("Google sign up failed.");
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
          <p className="text-sm text-muted-foreground">
            Start optimizing your AI prompts in seconds
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-border/60 glass-panel shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="font-display text-xl font-semibold">
              Create your account
            </CardTitle>
            <CardDescription className="text-xs">
              Join thousands of developers, researchers, and creators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Button
              variant="outline"
              type="button"
              className="w-full gap-2 border-border/70 hover:bg-muted/50 transition-colors"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <span className="relative bg-card px-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                Or sign up with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

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

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                      <span>Password Strength</span>
                      <span className="font-semibold text-foreground">{pwdStrength.label}</span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full flex-1 ${pwdStrength.score >= 1 ? pwdStrength.color : ""}`}
                      />
                      <div
                        className={`h-full flex-1 ${pwdStrength.score >= 2 ? pwdStrength.color : ""}`}
                      />
                      <div
                        className={`h-full flex-1 ${pwdStrength.score >= 3 ? pwdStrength.color : ""}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(c) => setAgreed(!!c)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full gap-2 font-medium" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account & Continue"}
                {!isLoading && <ArrowRight className="size-4" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/40 pt-4 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="ml-1 font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
