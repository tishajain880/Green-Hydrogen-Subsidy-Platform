import { useState } from "react";
import { NavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { cn } from "@/lib/utils";

export const Layout = ({
  children,
  userRole,
  userName,
  walletAddress,
  onWalletConnect,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // If a parent didn't pass `userRole`, try to read from stored session so pages
  // that render Layout directly (without wiring props) still show the proper menu.
  let resolvedRole = userRole;
  try {
    if (!resolvedRole && typeof window !== "undefined") {
      const s = localStorage.getItem("userSession");
      if (s) {
        const session = JSON.parse(s);
        resolvedRole = session?.role || resolvedRole;
      }
    }
  } catch (e) {
    // ignore parse errors
  }

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
        <SideBar userRole={resolvedRole} isOpen={sidebarOpen} />

        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "ml-0" : "ml-0"
          )}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

// Provide a default export for compatibility with re-export stubs
export default Layout;
