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
  FileCheck,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface SideBarProps {
  userRole?:
    | "GOV"
    | "PRODUCER"
    | "AUDITOR"
    | "BANK"
    | "MILESTONE_EDITOR"
    | string;
  isOpen?: boolean;
}

export const SideBar = ({ userRole, isOpen = true }: SideBarProps) => {
  export { default } from './SideBar.jsx';
  export * from './SideBar.jsx';
  const getMenuItems = (role?: string) => {
