import { useState, useEffect } from "react";
import apiClient from "@/services/api";
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
  ExternalLink,
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
    walletAddress: "",
  });

  const [notifications, setNotifications] = useState({
    milestones: true,
    disbursements: true,
    schemes: false,
    audit: true,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        organization: user.organization || "",
        walletAddress: user.walletAddress || "",
      });
      if (user.notifications) {
        setNotifications((prev) => ({ ...prev, ...user.notifications }));
      }
    }
  }, [user]);

  const handleSaveProfile = () => {
    // client-side validation
    const { validateEmail, validateName } = require("@/lib/validators");
    const nameValid = validateName(profile.name);
    if (!nameValid.ok) {
      toast({
        title: "Validation error",
        description: nameValid.message,
        variant: "destructive",
      });
      return;
    }
    const emailValid = validateEmail(profile.email);
    if (!emailValid.ok) {
      toast({
        title: "Validation error",
        description: emailValid.message,
        variant: "destructive",
      });
      return;
    }
    // Update localStorage
    const updatedUser = { ...user, ...profile };
    // Persist to backend
    apiClient
      .updateCurrentUser({
        name: profile.name,
        email: profile.email,
        organization: profile.organization,
        walletAddress: profile.walletAddress,
      })
      .then((res: any) => {
        localStorage.setItem("userSession", JSON.stringify(res.user));
        setUser(res.user);
        // notify other components to refresh auth state
        window.dispatchEvent(new Event("auth:update"));
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      })
      .catch((err: any) => {
        toast({
          title: "Error",
          description: err.message || "Failed to update profile",
          variant: "destructive",
        });
      });
  };

  const handleConnectWallet = () => {
    (async () => {
      try {
        if (!window.ethereum) {
          toast({
            title: "MetaMask required",
            description: "Please install MetaMask to connect your wallet",
            variant: "destructive",
          });
          return;
        }
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts && accounts[0];
        if (!address) return;

        // Nonce-based flow: request server nonce, sign it, then POST verification
        try {
          const nonceResp = await apiClient.request("/auth/nonce");
          const nonce = nonceResp && nonceResp.nonce;
          if (!nonce) {
            toast({
              title: "Error",
              description: "Unable to get nonce from server",
              variant: "destructive",
            });
            return;
          }

          const { ethers } = await import("ethers");
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const signature = await signer.signMessage(nonce);
          await apiClient.request("/auth/verify-wallet", {
            method: "POST",
            body: JSON.stringify({ address, signature }),
          });
        } catch (e) {
          // fallback to personal_sign with server nonce (if available)
          try {
            const nonceResp2 = await apiClient.request("/auth/nonce");
            const nonce2 = nonceResp2 && nonceResp2.nonce;
            if (!nonce2) throw e;
            const signature = await window.ethereum.request({
              method: "personal_sign",
              params: [nonce2, address],
            });
            await apiClient.request("/auth/verify-wallet", {
              method: "POST",
              body: JSON.stringify({ address, signature }),
            });
          } catch (e2) {
            console.error("Wallet connect error during nonce flow:", e2);
            toast({
              title: "Error",
              description:
                e2 && e2.message ? e2.message : "Unable to connect wallet",
              variant: "destructive",
            });
            return;
          }
        }

        // fetch latest user
        const me = await apiClient.getCurrentUser();
        const u = me && me.user ? me.user : null;
        if (u) {
          localStorage.setItem("userSession", JSON.stringify(u));
          setUser(u);
          setProfile((prev) => ({
            ...prev,
            walletAddress: u.walletAddress || address,
          }));
          // notify other components
          window.dispatchEvent(new Event("auth:update"));
        }
        toast({ title: "Wallet Connected", description: `${address}` });
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Unable to connect wallet",
          variant: "destructive",
        });
      }
    })();
  };

  const handleChangePassword = async () => {
    try {
      const current = window.prompt("Enter your current password");
      if (!current) return;
      const next = window.prompt("Enter your new password");
      if (!next) return;
      await apiClient.request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      toast({
        title: "Password changed",
        description: "Your password was updated successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to change password",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
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
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profile.organization}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      organization: e.target.value,
                    }))
                  }
                  placeholder="Your company or organization"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
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
                      <p className="font-mono text-sm">
                        {profile.walletAddress}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connected to Sepolia Testnet
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        No wallet connected
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={handleConnectWallet}
                variant={profile.walletAddress ? "outline" : "default"}
                className={
                  !profile.walletAddress
                    ? "w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                    : "w-full"
                }
              >
                <Wallet className="w-4 h-4 mr-2" />
                {profile.walletAddress
                  ? "Reconnect Wallet"
                  : "Connect MetaMask"}
              </Button>
              <div className="mt-2 text-sm">
                <button
                  className="text-primary underline"
                  onClick={() => {
                    // provider diagnostics
                    try {
                      const exists =
                        typeof window !== "undefined" && !!window.ethereum;
                      const isMM = exists && !!window.ethereum.isMetaMask;
                      const providerInfo = exists
                        ? `isMetaMask=${isMM}`
                        : "no provider";
                      console.info("Wallet provider info:", window.ethereum);
                      alert(
                        `Wallet provider: ${providerInfo}\nCheck console for full object (window.ethereum)`
                      );
                    } catch (e) {
                      console.error(e);
                      alert(
                        "Unable to inspect wallet provider in this environment"
                      );
                    }
                  }}
                >
                  Check wallet provider
                </button>
              </div>
              {/* Etherscan button intentionally removed for clarity */}
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
                  <p className="text-sm text-muted-foreground">
                    Get notified about milestone submissions and approvals
                  </p>
                </div>
                <Switch
                  checked={notifications.milestones}
                  onCheckedChange={(checked) => {
                    const newState = { ...notifications, milestones: checked };
                    setNotifications(newState);
                    apiClient
                      .updateCurrentUser({
                        notifications: { milestones: checked },
                      })
                      .catch(() => {
                        toast({
                          title: "Error",
                          description:
                            "Failed to update notification preference",
                          variant: "destructive",
                        });
                      });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Disbursement Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when payments are processed
                  </p>
                </div>
                <Switch
                  checked={notifications.disbursements}
                  onCheckedChange={(checked) => {
                    const newState = {
                      ...notifications,
                      disbursements: checked,
                    };
                    setNotifications(newState);
                    apiClient
                      .updateCurrentUser({
                        notifications: { disbursements: checked },
                      })
                      .catch(() => {
                        toast({
                          title: "Error",
                          description:
                            "Failed to update notification preference",
                          variant: "destructive",
                        });
                      });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Schemes</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new subsidy schemes
                  </p>
                </div>
                <Switch
                  checked={notifications.schemes}
                  onCheckedChange={(checked) => {
                    const newState = { ...notifications, schemes: checked };
                    setNotifications(newState);
                    apiClient
                      .updateCurrentUser({
                        notifications: { schemes: checked },
                      })
                      .catch(() => {
                        toast({
                          title: "Error",
                          description:
                            "Failed to update notification preference",
                          variant: "destructive",
                        });
                      });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Activities</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications for audit trail updates
                  </p>
                </div>
                <Switch
                  checked={notifications.audit}
                  onCheckedChange={(checked) => {
                    const newState = { ...notifications, audit: checked };
                    setNotifications(newState);
                    apiClient
                      .updateCurrentUser({ notifications: { audit: checked } })
                      .catch(() => {
                        toast({
                          title: "Error",
                          description:
                            "Failed to update notification preference",
                          variant: "destructive",
                        });
                      });
                  }}
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
                    {user.role === "MILESTONE_EDITOR" && "Milestone Editor"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Role: {user.role}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
              {/* Two-Factor Authentication removed for MVP as requested */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Your data is encrypted and stored securely. All blockchain
                  transactions are immutable and transparent.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
