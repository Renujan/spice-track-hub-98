import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessInfo } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { businessInfo } = useBusinessInfo();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Welcome back!",
          description: `Successfully logged in to ${businessInfo.shopName}`,
        });
        
        // Role-based redirect logic will be handled by App.tsx
        navigate("/");
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/login-background.png)' }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
      <Card className="shadow-2xl animate-slide-up bg-white/95 backdrop-blur-md border-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to {businessInfo.shopName}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your POS system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 transition-all duration-300 focus:shadow-md"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center">
              <Button variant="link" className="text-sm">
                Forgot your password?
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs">
              <p>• Admin: admin@spot.lk</p>
              <p>• Cashier: cashier@spot.lk</p>
              <p>• Chef: chef@spot.lk</p>
              <p>• Stock: stock@spot.lk</p>
              <p className="mt-2 font-medium">Password: password</p>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;