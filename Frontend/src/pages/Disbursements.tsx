import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ExternalLink,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Disbursements = () => {
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
    if (!user) {
      navigate("/login");
    }
  }, [navigate, user]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const { data: submissionsData = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () =>
      import("@/services/api").then((m) => m.apiClient.getSubmissions()),
    refetchInterval: 5000,
  });

  const queryClient = useQueryClient();

  // SSE subscription to get real-time submission updates from backend
  useEffect(() => {
    const base = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
    ).replace(/\/api\/?$/, "");
    const url = `${base}/api/stream/submissions`;
    let es;
    try {
      es = new EventSource(url);
      es.addEventListener("submission", () => {
        queryClient.invalidateQueries(["submissions"]);
      });
      es.onerror = () => {
        // On error, close EventSource; react-query polling remains as fallback
        try {
          es.close();
        } catch (e) {}
      };
    } catch (e) {
      // ignore if SSE unsupported
    }
    return () => {
      try {
        es && es.close();
      } catch (e) {}
    };
  }, [queryClient]);

  useEffect(() => {
    setSubmissions(submissionsData || []);
  }, [submissionsData]);

  const mockDisbursements = [
    {
      id: "DIS-001",
      schemeId: "SCH-1001",
      schemeName: "Green H₂ Scale-Up Phase 1",
      producer: "HydroCorp Ltd",
      amount: "₹12L",
      amountEth: "2.35 ETH",
      status: "COMPLETED",
      txHash: "0x1234...5678",
      contractAddress: "0xabcd...ef12",
      processedDate: "2024-12-15",
      milestone: "1000 kg H₂ produced",
    },
    {
      id: "DIS-002",
      schemeId: "SCH-1002",
      schemeName: "Clean Energy Incentive",
      producer: "EcoHydrogen Pvt",
      amount: "₹8L",
      amountEth: "1.85 ETH",
      status: "PENDING",
      txHash: null,
      contractAddress: "0xabcd...ef12",
      processedDate: null,
      milestone: "500 kg H₂ target achieved",
    },
    {
      id: "DIS-003",
      schemeId: "SCH-1001",
      schemeName: "Green H₂ Scale-Up Phase 1",
      producer: "GreenFuel Industries",
      amount: "₹15L",
      amountEth: "3.12 ETH",
      status: "COMPLETED",
      txHash: "0x9876...5432",
      contractAddress: "0xabcd...ef12",
      processedDate: "2024-12-05",
      milestone: "1200 kg H₂ produced",
    },
    {
      id: "DIS-004",
      schemeId: "SCH-1003",
      schemeName: "Industrial H₂ Subsidy",
      producer: "TechHydrogen Corp",
      amount: "₹25L",
      amountEth: "5.45 ETH",
      status: "QUEUED",
      txHash: null,
      contractAddress: "0xabcd...ef12",
      processedDate: null,
      milestone: "2000 kg H₂ milestone pending",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "QUEUED":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Queued
          </Badge>
        );
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If real submissions available, map them to disbursement-like view
  const real = submissions.map((s: any) => ({
    id: s._id,
    schemeId: s.project?._id || null,
    schemeName: s.project?.title || "Unknown",
    producer: s.producer?.name || "Producer",
    amount: s.amount || "—",
    amountEth: s.amountEth || "—",
    status:
      s.status === "verified"
        ? "COMPLETED"
        : s.status === "pending"
        ? "PENDING"
        : "REJECTED",
    txHash: s.txHash,
    contractAddress: s.project?.contractAddress || null,
    processedDate: s.updatedAt,
    milestone: `Milestone #${s.milestoneIndex}`,
  }));

  const filteredDisbursements = real.length
    ? user.role === "PRODUCER"
      ? real.filter((d) => d.producer === (user.name || ""))
      : real
    : user.role === "PRODUCER"
    ? mockDisbursements.filter((d) => d.producer === "HydroCorp Ltd")
    : mockDisbursements;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user.role === "PRODUCER"
                ? "My Payments"
                : user.role === "BANK"
                ? "Settlement Queue"
                : "Disbursements"}
            </h1>
            <p className="text-muted-foreground">
              {user.role === "PRODUCER"
                ? "Track your subsidy payments and wallet credits"
                : user.role === "BANK"
                ? "Process and manage subsidy disbursements"
                : "Monitor all subsidy disbursements and settlements"}
            </p>
          </div>
        </div>

        {user.role === "BANK" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-2xl font-bold">₹27L</p>
                    <p className="text-sm text-muted-foreground">
                      Processed Today
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">99.8%</p>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6">
          {filteredDisbursements.map((disbursement) => (
            <Card
              key={disbursement.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {disbursement.schemeName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.role !== "PRODUCER" &&
                        `Producer: ${disbursement.producer} • `}
                      ID: {disbursement.id}
                    </p>
                  </div>
                  {getStatusBadge(disbursement.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">{disbursement.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {disbursement.amountEth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Contract
                        </p>
                        <p className="font-mono text-sm">
                          {disbursement.contractAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Milestone
                        </p>
                        <p className="text-sm">{disbursement.milestone}</p>
                      </div>
                    </div>
                  </div>

                  {disbursement.processedDate && (
                    <div className="text-sm text-muted-foreground">
                      Processed on{" "}
                      {new Date(
                        disbursement.processedDate
                      ).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {disbursement.txHash && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${
                            import.meta.env.VITE_ETH_EXPLORER_BASE ||
                            "https://sepolia.etherscan.io"
                          }/tx/${disbursement.txHash}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </a>
                      </Button>
                    )}
                    {user.role === "BANK" &&
                      disbursement.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                        >
                          Process Payment
                        </Button>
                      )}
                    {user.role === "GOV" &&
                      disbursement.status === "QUEUED" && (
                        <Button
                          size="sm"
                          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                        >
                          Approve Disbursement
                        </Button>
                      )}
                  </div>

                  {disbursement.status === "COMPLETED" && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {user.role === "PRODUCER"
                            ? "Wallet Credited Successfully"
                            : "Payment Completed"}
                        </span>
                      </div>
                      {disbursement.txHash && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Transaction: {disbursement.txHash}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
