import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, User, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const NavBar = ({
  userRole,
  userName,
  walletAddress,
  onMenuClick,
  onWalletConnect,
}) => {
  const [notifications, setNotifications] = useState(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // fetch notifications when user available
  const loadNotifications = async () => {
    try {
      const res = await apiClient.getNotifications();
      if (!res) return;
      setList(res);
      setNotifications(res.filter((n) => !n.read).length);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (user && user._id) loadNotifications();
  }, [user]);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "GOV":
        return "bg-gradient-primary text-primary-foreground";
      case "PRODUCER":
        return "bg-blue-500 text-white";
      case "AUDITOR":
        return "bg-orange-500 text-white";
      case "BANK":
        return "bg-purple-500 text-white";
      case "MILESTONE_EDITOR":
        return "bg-green-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <nav className="bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H₂</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg">H₂ Subsidy Chain</h1>
            <Badge variant="secondary" className="text-xs bg-warning text-warning-foreground">Testnet: Sepolia</Badge>
          </div>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {(walletAddress && walletAddress.length) ||
        (user && user.walletAddress) ? (
          <div className="hidden sm:flex items-center gap-2 bg-sidebar-accent rounded-lg px-3 py-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sidebar-foreground text-sm font-mono">
              {(walletAddress || (user && user.walletAddress)).slice(0, 6)}...
              {(walletAddress || (user && user.walletAddress)).slice(-4)}
            </span>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={async () => {
              try {
                if (typeof window === "undefined" || !window.ethereum) {
                  toast({
                    title: "MetaMask not detected",
                    description:
                      "No injected wallet found. Ensure the MetaMask extension is installed, enabled for this site, and unlocked.",
                    variant: "destructive",
                  });
                  console.info(
                    "window.ethereum ===",
                    typeof window !== "undefined"
                      ? window.ethereum
                      : "undefined"
                  );
                  return;
                }

                if (!window.ethereum.isMetaMask) {
                  toast({
                    title: "Non-MetaMask provider detected",
                    description:
                      "A wallet provider was detected but it does not identify as MetaMask. You can still try to connect.",
                    variant: "warning",
                  });
                }

                const accounts = await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
                const address = accounts && accounts[0];
                if (!address) return;

                if (!user) {
                  toast({
                    title: "Login required",
                    description: "Please login before linking a wallet",
                  });
                  navigate("/login");
                  return;
                }

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
                    console.error(
                      "Connect wallet error during nonce flow:",
                      e2
                    );
                    const msg =
                      e2 && e2.message ? e2.message : "Unable to link wallet";
                    toast({
                      title: "Error",
                      description: msg,
                      variant: "destructive",
                    });
                  }
                }

                toast({ title: "Wallet linked", description: `${address}` });
                window.dispatchEvent(new Event("auth:update"));
              } catch (err) {
                console.error("Connect wallet error:", err);
                const msg =
                  err && err.message ? err.message : "Unable to link wallet";
                toast({
                  title: "Error",
                  description: msg,
                  variant: "destructive",
                });
              }
            }}
            className="hidden sm:flex bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              setOpen(!open);
              if (!open) loadNotifications();
            }}
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>

          {open && (
            <div className="absolute right-0 mt-2 w-96 bg-card border rounded-md shadow-lg z-50">
              <div className="p-3 text-sm font-semibold">Notifications</div>
              <div className="max-h-64 overflow-auto">
                {list.length === 0 && (
                  <div className="p-3 text-xs text-muted-foreground">
                    No notifications
                  </div>
                )}
                {list.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 border-b cursor-pointer ${
                      n.read ? "bg-muted/10" : "bg-card"
                    }`}
                    onClick={async () => {
                      try {
                        if (!n.read) {
                          await apiClient.markNotificationRead(n._id);
                          setList((prev) =>
                            prev.map((it) =>
                              it._id === n._id ? { ...it, read: true } : it
                            )
                          );
                          setNotifications((prev) => Math.max(0, prev - 1));
                        }
                      } catch (e) {}
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {n.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t text-center text-xs">
                <a className="text-primary" href="#/notifications">
                  View all
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {userRole && (
            <Badge className={cn("text-xs", getRoleBadgeVariant(userRole))}>
              {userRole}
            </Badge>
          )}

          <div className="flex items-center gap-2 text-sidebar-foreground">
            <User className="h-4 w-4" />
            <Link
              to="/settings"
              className="text-sm font-medium hidden sm:inline cursor-pointer hover:underline"
              title="Edit profile"
            >
              {userName || (user && user.name) || "Demo User"}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Default export for compatibility with re-export stubs
export default NavBar;
