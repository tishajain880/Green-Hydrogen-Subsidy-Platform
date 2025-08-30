import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  Target, 
  CreditCard, 
  Shield, 
  Settings, 
  Users,
  BarChart3,
  FileCheck
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface SideBarProps {
  userRole?: "GOV" | "PRODUCER" | "AUDITOR" | "BANK";
  isOpen?: boolean;
}

export const SideBar = ({ userRole, isOpen = true }: SideBarProps) => {
  const location = useLocation();

  const getMenuItems = (role?: string) => {
    const commonItems = [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
    ];

    const roleBasedItems = {
      GOV: [
        { icon: FileText, label: "Schemes", path: "/schemes" },
        { icon: Users, label: "Producers", path: "/producers" },
        { icon: CreditCard, label: "Disbursements", path: "/disbursements" },
        { icon: Shield, label: "Audit Trail", path: "/audit" },
        { icon: BarChart3, label: "Analytics", path: "/analytics" },
      ],
      PRODUCER: [
        { icon: FileText, label: "My Schemes", path: "/schemes" },
        { icon: Target, label: "Milestones", path: "/milestones" },
        { icon: CreditCard, label: "Payments", path: "/payments" },
      ],
      AUDITOR: [
        { icon: FileCheck, label: "Verifications", path: "/verifications" },
        { icon: Shield, label: "Audit Trail", path: "/audit" },
        { icon: Target, label: "Milestones", path: "/milestones" },
      ],
      BANK: [
        { icon: CreditCard, label: "Disbursements", path: "/disbursements" },
        { icon: FileText, label: "Settlements", path: "/settlements" },
        { icon: Shield, label: "Audit Trail", path: "/audit" },
      ]
    };

    return [
      ...commonItems,
      ...(role ? roleBasedItems[role] || [] : []),
      { icon: Settings, label: "Settings", path: "/settings" },
    ];
  };

  const menuItems = getMenuItems(userRole);

  return (
    <aside className={cn(
      "bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                size={isOpen ? "default" : "sm"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-primary",
                  !isOpen && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="truncate">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Role Info */}
      {isOpen && userRole && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-sidebar-accent rounded-lg p-3">
            <div className="text-xs text-sidebar-foreground/70 mb-1">
              Current Role
            </div>
            <div className="text-sm font-medium text-sidebar-foreground">
              {userRole === "GOV" && "Government Official"}
              {userRole === "PRODUCER" && "H₂ Producer"}
              {userRole === "AUDITOR" && "Milestone Auditor"}
              {userRole === "BANK" && "Settlement Bank"}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};