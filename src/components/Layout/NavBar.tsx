import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, User, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavBarProps {
  userRole?: "GOV" | "PRODUCER" | "AUDITOR" | "BANK";
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
  onWalletConnect 
}: NavBarProps) => {
  const [notifications, setNotifications] = useState(3);

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "GOV": return "bg-gradient-primary text-primary-foreground";
      case "PRODUCER": return "bg-blue-500 text-white";
      case "AUDITOR": return "bg-orange-500 text-white";
      case "BANK": return "bg-purple-500 text-white";
      default: return "bg-muted text-muted-foreground";
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
            <span className="text-primary-foreground font-bold text-sm">H₂</span>
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
        {/* Wallet Connect */}
        {walletAddress ? (
          <div className="hidden sm:flex items-center gap-2 bg-sidebar-accent rounded-lg px-3 py-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sidebar-foreground text-sm font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        ) : (
          <Button 
            size="sm" 
            onClick={onWalletConnect}
            className="hidden sm:flex bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {userRole && (
            <Badge className={cn("text-xs", getRoleBadgeVariant(userRole))}>
              {userRole}
            </Badge>
          )}
          
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">
              {userName || "Demo User"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};