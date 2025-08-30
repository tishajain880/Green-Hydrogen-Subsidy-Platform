import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, 
  User, 
  Wallet,
  Bell,
  Shield,
  Save,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      setUser(JSON.parse(session));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    organization: "",
    walletAddress: ""
  });

  const [notifications, setNotifications] = useState({
    milestones: true,
    disbursements: true,
    schemes: false,
    audit: true
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        organization: user.organization || "",
        walletAddress: user.walletAddress || ""
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // Update localStorage
    const updatedUser = { ...user, ...profile };
    localStorage.setItem("userSession", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    toast({
      title: "Success",
      description: "Profile updated successfully!",
    });
  };

  const handleConnectWallet = () => {
    // Simulate wallet connection
    const mockWalletAddress = "0x742d35Cc6634C0532925a3b8D";
    setProfile(prev => ({ ...prev, walletAddress: mockWalletAddress }));
    
    toast({
      title: "Wallet Connected",
      description: "MetaMask wallet connected successfully!",
    });
  };

  if (!user) return null;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profile.organization}
                  onChange={(e) => setProfile(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Your company or organization"
                />
              </div>
              <Button onClick={handleSaveProfile} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Wallet</Label>
                {profile.walletAddress ? (
                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <Wallet className="w-4 h-4 text-success" />
                    <div className="flex-1">
                      <p className="font-mono text-sm">{profile.walletAddress}</p>
                      <p className="text-xs text-muted-foreground">Connected to Sepolia Testnet</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">No wallet connected</p>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleConnectWallet}
                variant={profile.walletAddress ? "outline" : "default"}
                className={!profile.walletAddress ? "w-full bg-gradient-primary text-primary-foreground hover:opacity-90" : "w-full"}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {profile.walletAddress ? "Reconnect Wallet" : "Connect MetaMask"}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Etherscan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Milestone Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about milestone submissions and approvals</p>
                </div>
                <Switch
                  checked={notifications.milestones}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, milestones: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Disbursement Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive alerts when payments are processed</p>
                </div>
                <Switch
                  checked={notifications.disbursements}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, disbursements: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Schemes</p>
                  <p className="text-sm text-muted-foreground">Get notified about new subsidy schemes</p>
                </div>
                <Switch
                  checked={notifications.schemes}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, schemes: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Activities</p>
                  <p className="text-sm text-muted-foreground">Notifications for audit trail updates</p>
                </div>
                <Switch
                  checked={notifications.audit}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, audit: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <div className="p-3 bg-muted/50 border rounded-lg">
                  <p className="font-medium">
                    {user.role === "GOV" && "Government Official"}
                    {user.role === "PRODUCER" && "H₂ Producer"}
                    {user.role === "AUDITOR" && "Milestone Auditor"}
                    {user.role === "BANK" && "Settlement Bank"}
                  </p>
                  <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Two-Factor Authentication
              </Button>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Your data is encrypted and stored securely. All blockchain transactions are immutable and transparent.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};