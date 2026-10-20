import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, verifyEmail, isLoading } = useAuth();
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      await verifyEmail(code || "123456");
      toast.success("Email verified successfully!");
      navigate("/onboarding", { replace: true });
    } catch {
      toast.error("Invalid verification code. Try again.");
    }
  };

  const handleResend = async () => {
    setResending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setResending(false);
    toast.success("A new verification code has been sent to your email.");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logoSrc}
            alt="Tabbed logo"
            className="size-10 rounded-xl shadow-[0_0_24px_-4px_var(--primary)] mb-2"
          />
          <span className="font-display text-2xl font-bold tracking-tight">Verify your email</span>
          <p className="text-xs text-muted-foreground mt-1">
            We sent a 6-digit confirmation code to{" "}
            <span className="font-medium text-foreground">
              {user?.email || "your email address"}
            </span>
          </p>
        </div>

        {/* Verification Card */}
        <Card className="border-border/60 glass-panel shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-2">
              <Mail className="size-6" />
            </div>
            <CardTitle className="font-display text-lg font-semibold">
              Enter Security Code
            </CardTitle>
            <CardDescription className="text-xs">
              Check your inbox (and spam folder) for the 6-digit verification code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex justify-center">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="text-center font-mono text-xl tracking-[0.4em] max-w-[200px] h-12"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full gap-2 font-medium" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Continue to Onboarding"}
                {!isLoading && <ArrowRight className="size-4" />}
              </Button>
            </form>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Demo shortcut: Click below to auto-verify instantly.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVerify()}
                className="w-full gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <ShieldCheck className="size-4" /> Auto-Verify Demo Code (123456)
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
            <span>Didn&apos;t get the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Sending..." : "Resend email"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
