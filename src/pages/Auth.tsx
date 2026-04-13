import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! You can now sign in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📡</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nearby</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with people around you
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="rounded-2xl bg-surface-warm p-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm"
            />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

        <div className="flex gap-3 justify-center mt-6">
          <a href="/terms" className="text-[10px] text-muted-foreground hover:text-primary underline">Terms of Service</a>
          <a href="/privacy" className="text-[10px] text-muted-foreground hover:text-primary underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
