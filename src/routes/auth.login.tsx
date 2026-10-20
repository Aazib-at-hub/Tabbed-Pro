import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2 } from "lucide-react";
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const from = (location.state as { from?: string })?.from || "/home";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Welcome back to Tabbed Pro!");
        navigate(from, { replace: true });
      }
    } catch {
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success("Signed in with Google successfully!");
        navigate("/onboarding", { replace: true });
      }
    } catch {
      toast.error("Google sign in failed.");
    }
  };

  const handleDemoLogin = async () => {
    try {
      await login("aazib@example.com", "password123");
      toast.success("Signed in as Demo User!");
      navigate(from, { replace: true });
    } catch {
      toast.error("Demo login failed.");
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
          <p className="text-sm text-muted-foreground">The AI Communication Layer</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 glass-panel shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="font-display text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access your prompt vault and optimizer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Button
              variant="outline"
              type="button"
              className="w-full gap-2 border-border/70 hover:bg-muted/50 transition-colors"
              onClick={handleGoogleLogin}
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
              Continue with Google
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <span className="relative bg-card px-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                Or continue with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email address
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(c) => setRemember(!!c)}
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Keep me signed in for 30 days
                </label>
              </div>

              <Button type="submit" className="w-full gap-2 font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in to Dashboard"}
                {!isLoading && <ArrowRight className="size-4" />}
              </Button>
            </form>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
              <p className="text-xs font-medium text-foreground">
                Want to test without registering?
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDemoLogin}
                className="mt-1 h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
              >
                <Sparkles className="size-3.5" />
                Sign in with 1-Click Demo Account
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/40 pt-4 text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="ml-1 font-semibold text-primary hover:underline">
              Create account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
