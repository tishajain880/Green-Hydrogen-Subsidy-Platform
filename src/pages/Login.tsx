import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"GOV" | "PRODUCER" | "AUDITOR" | "BANK">();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const demoUsers = [
    { email: "gov@demo.in", role: "GOV", name: "Government Officer", desc: "Create schemes, manage producers" },
    { email: "producer@demo.in", role: "PRODUCER", name: "H₂ Producer", desc: "Submit milestones, track payments" },
    { email: "auditor@demo.in", role: "AUDITOR", name: "Milestone Auditor", desc: "Verify production claims" },
    { email: "bank@demo.in", role: "BANK", name: "Settlement Bank", desc: "Process disbursements" },
  ];

  const handleLogin = async () => {
    if (!email || !password || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a role.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store user session (in real app, this would be JWT)
    localStorage.setItem("userSession", JSON.stringify({
      email,
      role,
      name: demoUsers.find(u => u.email === email)?.name || "Demo User",
      timestamp: Date.now()
    }));
    
    toast({
      title: "Login Successful",
      description: `Welcome back! Redirecting to your ${role} dashboard.`,
    });
    
    navigate("/dashboard");
    setIsLoading(false);
  };

  const quickLogin = (demoUser: typeof demoUsers[0]) => {
    setEmail(demoUser.email);
    setRole(demoUser.role as any);
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">H₂</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Subsidy Chain Platform</h1>
              <Badge variant="outline" className="border-warning text-warning mt-1">
                Demo Environment
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Platform Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOV">Government Official</SelectItem>
                    <SelectItem value="PRODUCER">H₂ Producer</SelectItem>
                    <SelectItem value="AUDITOR">Milestone Auditor</SelectItem>
                    <SelectItem value="BANK">Settlement Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Demo Environment • Use any password
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Demo Access */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Quick Demo Access</h2>
              <p className="text-muted-foreground text-sm">
                Click any role below to instantly login and explore the platform
              </p>
            </div>

            <div className="space-y-3">
              {demoUsers.map((user) => (
                <Card 
                  key={user.role} 
                  className="cursor-pointer hover:shadow-elevated transition-shadow border-l-4 border-l-primary"
                  onClick={() => quickLogin(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{user.desc}</p>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {user.email}
                        </code>
                      </div>
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Demo Features:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Pre-loaded subsidy schemes and milestone data</li>
                <li>• Simulated blockchain transactions on Sepolia testnet</li>
                <li>• Role-based dashboards and workflows</li>
                <li>• MetaMask wallet integration for producers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};