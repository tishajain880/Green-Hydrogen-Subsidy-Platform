import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Audit = () => {
  const [user, setUser] = useState<any>(() => {
    try {
      const s = localStorage.getItem("userSession");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    // if user is not present in storage, redirect to login
    if (!user) {
      navigate("/login");
    }
  }, [navigate, user]);

  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Use react-query to fetch submissions and notifications and recompute audit trail every 5s
  const submissionsQuery = useQuery({
    queryKey: ["submissions"],
    queryFn: () =>
      import("@/services/api").then((m) => m.apiClient.getSubmissions()),
    refetchInterval: 5000,
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      import("@/services/api").then((m) => m.apiClient.getNotifications()),
    refetchInterval: 5000,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setLoadError(null);
    try {
      const submissions = submissionsQuery.data || [];
      const notifications = notificationsQuery.data || [];

      const submissionEvents = (submissions || []).flatMap((s: any) => {
        try {
          return [
            {
              id: s._id,
              timestamp: s.createdAt || s.updatedAt,
              actor:
                s.producer?.name ||
                (s.producer && (s.producer.email || s.producer._id)) ||
                "Producer",
              role: "PRODUCER",
              action:
                s.status === "pending"
                  ? "MILESTONE_SUBMITTED"
                  : s.status === "verified"
                  ? "MILESTONE_VERIFIED"
                  : "MILESTONE_REJECTED",
              entityType: "MILESTONE",
              entityId: `MS-${s._id}`,
              details: `Milestone #${s.milestoneIndex} for project ${
                s.project?.title || s.project
              }`,
              txHash: s.txHash || null,
              schemeId: s.project?._id || null,
            },
          ];
        } catch (e) {
          return [];
        }
      });

      const notificationEvents = (notifications || []).map((n: any) => ({
        id: n._id,
        timestamp: n.createdAt,
        actor: "System",
        role: "SYSTEM",
        action: n.type ? n.type.toUpperCase() : "NOTIFICATION",
        entityType: "NOTIFICATION",
        entityId: n._id,
        details: n.message,
        txHash: n.data && n.data.txHash ? n.data.txHash : null,
        schemeId: n.data && n.data.projectId ? n.data.projectId : null,
      }));

      const combined = submissionEvents.concat(notificationEvents);
      // safe sort - handle missing timestamps
      combined.sort((a, b) => {
        const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });
      setAuditTrail(combined);
    } catch (err: any) {
      console.error("Failed to compose audit trail", err);
      setLoadError(err?.message || "Failed to load audit trail");
      setAuditTrail([]);
    }
  }, [submissionsQuery.data, notificationsQuery.data]);

  // SSE subscription for audit logs and submissions
  useEffect(() => {
    const base = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
    ).replace(/\/api\/?$/, "");
    const subUrl = `${base}/api/stream/submissions`;
    const auditUrl = `${base}/api/stream/audit-logs`;
    let esSub: EventSource | undefined;
    let esAudit: EventSource | undefined;
    try {
      esSub = new EventSource(subUrl);
      esSub.addEventListener("submission", () =>
        queryClient.invalidateQueries(["submissions"])
      );
      esSub.onerror = () => {
        try {
          esSub && esSub.close();
        } catch (e) {}
      };
    } catch (e) {}
    try {
      esAudit = new EventSource(auditUrl);
      esAudit.addEventListener("audit_log", () =>
        queryClient.invalidateQueries(["auditLogs"])
      );
      esAudit.onerror = () => {
        try {
          esAudit && esAudit.close();
        } catch (e) {}
      };
    } catch (e) {}
    return () => {
      try {
        esSub && esSub.close();
      } catch (e) {}
      try {
        esAudit && esAudit.close();
      } catch (e) {}
    };
  }, [queryClient]);

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
        return (
          <Badge className="bg-gradient-primary text-primary-foreground">
            Government
          </Badge>
        );
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
              Immutable record of all system activities and blockchain
              transactions
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
                  <p className="text-sm text-muted-foreground">
                    Schemes Created
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">347</p>
                  <p className="text-sm text-muted-foreground">
                    Milestones Verified
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">₹4.2Cr</p>
                  <p className="text-sm text-muted-foreground">
                    Total Disbursed
                  </p>
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
            <Input placeholder="Search audit records..." className="pl-10" />
          </div>
        </div>

        <div className="space-y-4">
          {auditTrail.map((record) => (
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
                            {String(record.action)
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </h3>
                          {getRoleBadge(record.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.details}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By: {record.actor}</span>
                          <span>•</span>
                          <span>
                            {record.timestamp
                              ? new Date(record.timestamp).toLocaleString()
                              : ""}
                          </span>
                          <span>•</span>
                          <span>ID: {record.entityId}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Scheme: {record.schemeId}
                        </p>
                        {record.txHash && (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            href={`${
                              import.meta.env.VITE_ETH_EXPLORER_BASE ||
                              "https://sepolia.etherscan.io"
                            }/tx/${record.txHash}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Transaction
                          </a>
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
