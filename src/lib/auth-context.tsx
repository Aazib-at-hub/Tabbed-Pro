import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserProfile {
  profession?: string;
  mainDomain?: string;
  platforms?: string[];
  responseStyle?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  isOnboarded: boolean;
  profile?: UserProfile;
  subscriptionTier?: "free" | "pro" | "teams";
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled";
  currentPeriodEnd?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  completeOnboarding: (onboardingData: UserProfile) => void;
  updateSubscriptionTier: (
    tier: "free" | "pro" | "teams",
    status?: "active" | "trialing" | "past_due" | "canceled",
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tabbed_pro_auth_user";

// Default demo user for instant login / initial state if none exists
const DEMO_USER: User = {
  id: "usr_demo_123",
  name: "Aazib Khan",
  email: "aazib@example.com",
  emailVerified: true,
  isOnboarded: true,
  subscriptionTier: "free",
  subscriptionStatus: "active",
  profile: {
    profession: "Developer",
    mainDomain: "Coding",
    platforms: ["ChatGPT", "Claude"],
    responseStyle: "Detailed",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore JSON parse errors
    }
    // Default to demo user for seamless initial state
    return DEMO_USER;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Handle storage quota or access errors gracefully
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const existingUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name:
        email
          .split("@")[0]
          .replace(/[^a-zA-Z]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || "Pro User",
      email,
      emailVerified: true,
      isOnboarded: user?.email === email ? user.isOnboarded : false,
      profile: user?.email === email ? user.profile : undefined,
    };

    setUser(existingUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      emailVerified: false,
      isOnboarded: false,
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const googleUser: User = {
      id: "usr_google_" + Math.random().toString(36).substring(2, 9),
      name: "Alex Rivera",
      email: "alex.rivera@gmail.com",
      emailVerified: true,
      isOnboarded: false, // Triggers 4-step onboarding wizard
    };

    setUser(googleUser);
    setIsLoading(false);
    return true;
  };

  const verifyEmail = async (_code: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (user) {
      const updated = { ...user, emailVerified: true };
      setUser(updated);
    }
    setIsLoading(false);
    return true;
  };

  const requestPasswordReset = async (_email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    return true;
  };

  const completeOnboarding = (onboardingData: UserProfile) => {
    if (!user) return;
    const updated: User = {
      ...user,
      isOnboarded: true,
      profile: onboardingData,
    };
    setUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const updateSubscriptionTier = (
    tier: "free" | "pro" | "teams",
    status: "active" | "trialing" | "past_due" | "canceled" = "active",
  ) => {
    if (!user) return;
    const updated: User = {
      ...user,
      subscriptionTier: tier,
      subscriptionStatus: status,
    };
    setUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        verifyEmail,
        requestPasswordReset,
        completeOnboarding,
        updateSubscriptionTier,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
