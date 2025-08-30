import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Search, 
  ExternalLink,
  FileText,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Audit = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      setUser(JSON.parse(session));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;

  const mockAuditTrail = [
    {
      id: "AUD-001",
      timestamp: "2024-12-15T10:30:00Z",
      actor: "Dr. Smith",
      role: "AUDITOR",
      action: "MILESTONE_APPROVED",
      entityType: "MILESTONE",
      entityId: "MS-001",
      details: "Approved milestone submission for 850kg H₂ production",
      txHash: "0x1234...5678",
      schemeId: "SCH-1001"
    },
    {
      id: "AUD-002",
      timestamp: "2024-12-15T09:15:00Z",
      actor: "Settlement Bank",
      role: "BANK",
      action: "DISBURSEMENT_PROCESSED",
      entityType: "DISBURSEMENT",
      entityId: "DIS-001",
      details: "Processed ₹12L disbursement to HydroCorp Ltd",
      txHash: "0x1234...5678",
      schemeId: "SCH-1001"
    },
    {
      id: "AUD-003",
      timestamp: "2024-12-14T16:45:00Z",
      actor: "HydroCorp Ltd",
      role: "PRODUCER",
      action: "MILESTONE_SUBMITTED",
      entityType: "MILESTONE",
      entityId: "MS-001",
      details: "Submitted milestone for 850kg H₂ production with proof documents",
      txHash: null,
      schemeId: "SCH-1001"
    },
    {
      id: "AUD-004",
      timestamp: "2024-12-10T11:20:00Z",
      actor: "EcoHydrogen Pvt",
      role: "PRODUCER",
      action: "MILESTONE_SUBMITTED",
      entityType: "MILESTONE",
      entityId: "MS-002",
      details: "Submitted milestone for 300kg H₂ production",
      txHash: null,
      schemeId: "SCH-1002"
    },
    {
      id: "AUD-005",
      timestamp: "2024-12-05T14:30:00Z",
      actor: "Gov Admin",
      role: "GOV",
      action: "SCHEME_ACTIVATED",
      entityType: "SCHEME",
      entityId: "SCH-1003",
      details: "Activated Industrial H₂ Subsidy scheme with ₹25L allocation",
      txHash: "0x9876...5432",
      schemeId: "SCH-1003"
    },
    {
      id: "AUD-006",
      timestamp: "2024-12-05T13:15:00Z",
      actor: "Dr. Johnson",
      role: "AUDITOR",
      action: "MILESTONE_APPROVED",
      entityType: "MILESTONE",
      entityId: "MS-003",
      details: "Approved milestone for 1200kg H₂ production by GreenFuel Industries",
      txHash: "0x9876...5432",
      schemeId: "SCH-1001"
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "MILESTONE_APPROVED":
      case "DISBURSEMENT_PROCESSED":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "MILESTONE_SUBMITTED":
        return <Clock className="w-4 h-4 text-warning" />;
      case "SCHEME_ACTIVATED":
        return <FileText className="w-4 h-4 text-primary" />;
      case "PRODUCER_REGISTERED":
        return <Users className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "GOV":
        return <Badge className="bg-gradient-primary text-primary-foreground">Government</Badge>;
      case "PRODUCER":
        return <Badge className="bg-blue-500 text-white">Producer</Badge>;
      case "AUDITOR":
        return <Badge className="bg-orange-500 text-white">Auditor</Badge>;
      case "BANK":
        return <Badge className="bg-purple-500 text-white">Bank</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Audit Trail
            </h1>
            <p className="text-muted-foreground">
              Immutable record of all system activities and blockchain transactions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Schemes Created</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">347</p>
                  <p className="text-sm text-muted-foreground">Milestones Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">₹4.2Cr</p>
                  <p className="text-sm text-muted-foreground">Total Disbursed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">1,245</p>
                  <p className="text-sm text-muted-foreground">Audit Records</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search audit records..." 
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {mockAuditTrail.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(record.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {record.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          {getRoleBadge(record.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.details}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By: {record.actor}</span>
                          <span>•</span>
                          <span>{new Date(record.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span>ID: {record.entityId}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Scheme: {record.schemeId}
                        </p>
                        {record.txHash && (
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="w-3 h-3" />
                            View Transaction
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            All audit records are cryptographically secured and tamper-proof
          </p>
        </div>
      </div>
    </Layout>
  );
};