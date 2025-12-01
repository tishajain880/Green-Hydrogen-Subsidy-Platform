import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, User, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavBarProps {
  userRole?:
    | "GOV"
    | "PRODUCER"
    | "AUDITOR"
    | "BANK"
    | "MILESTONE_EDITOR"
    | string;
  userName?: string;
  walletAddress?: string;
  onMenuClick?: () => void;
  onWalletConnect?: () => void;
}

export const NavBar = ({
  userRole,
  userName,
  walletAddress,
  onMenuClick,
  onWalletConnect,
}: NavBarProps) => {
  const [notifications, setNotifications] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // fetch notifications when user available
  const loadNotifications = async () => {
    try {
      const res = await apiClient.getNotifications();
      if (!res) return;
      setList(res);
      setNotifications(res.filter((n: any) => !n.read).length);
    } catch (err) {
      // ignore
    }
  };

  // load on mount and when user changes
  useEffect(() => {
    if (user && user._id) loadNotifications();
  }, [user]);

  const getRoleBadgeVariant = (role?: string) => {
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

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              H₂
            </span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg">
              H₂ Subsidy Chain
            </h1>
            <Badge
              variant="secondary"
              className="text-xs bg-warning text-warning-foreground"
            >
              Testnet: Sepolia
            </Badge>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Role-specific links are available in the left sidebar; top navbar kept minimal */}
        {/* Wallet Connect: prefer authenticated user's linked wallet if available */}
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
              export { default } from './NavBar.jsx';
              export * from './NavBar.jsx';
                if (typeof window === "undefined" || !window.ethereum) {
