import { useState } from "react";
import { NavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  userRole?: "GOV" | "PRODUCER" | "AUDITOR" | "BANK";
  userName?: string;
  walletAddress?: string;
  onWalletConnect?: () => void;
}

export const Layout = ({ 
  children, 
  userRole, 
  userName, 
  walletAddress, 
  onWalletConnect 
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <NavBar
        userRole={userRole}
        userName={userName}
        walletAddress={walletAddress}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onWalletConnect={onWalletConnect}
      />
      
      <div className="flex">
        <SideBar userRole={userRole} isOpen={sidebarOpen} />
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-0" : "ml-0"
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};