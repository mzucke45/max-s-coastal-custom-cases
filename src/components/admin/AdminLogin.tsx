import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/adminApi";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminApi.login(password);
      if (res.success) {
        onLogin();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Admin Portal</h1>
          <p className="text-muted-foreground text-sm font-body mt-1">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-lg"
            maxLength={200}
          />
          {error && <p className="text-destructive text-sm font-body">{error}</p>}
          <Button type="submit" disabled={loading || !password} className="w-full h-12 rounded-lg">
            {loading ? "Checking..." : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
