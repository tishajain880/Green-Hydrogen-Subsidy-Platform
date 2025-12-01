export { default } from "./Payments.jsx";
export * from "./Payments.jsx";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Clock,
  CheckCircle,
  ExternalLink,
  Wallet,
} from "lucide-react";

const Payments = () => {
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  useEffect(() => {
    // Try to fetch submissions/payments via api client if available, otherwise use mock
    import("@/services/api")
      .then(({ apiClient }) => {
        apiClient
          .getSubmissions()
          .then((res: any) => {
            const mapped = (res || []).map((s: any) => ({
              id: s._id,
              scheme: s.project?.title || "Unknown",
              amount: s.amount || "—",
              amountEth: s.amountEth || "—",
              status:
                s.status === "verified"
                  ? "COMPLETED"
                  : s.status === "pending"
                  ? "PENDING"
                  : "REJECTED",
              txHash: s.txHash || null,
              processedDate: s.updatedAt,
              milestone: `Milestone #${s.milestoneIndex}`,
            }));
            setPayments(mapped);
          })
          .catch(() => {
            // ignore
          });
      })
      .catch(() => {});

    // fallback mock data for demonstration
    const mock = [
      {
        id: "P-1001",
        scheme: "Green H₂ Scale-Up Phase 1",
        amount: "₹12,00,000",
        amountEth: "2.35 ETH",
        status: "COMPLETED",
        txHash: "0x1234abcd",
        processedDate: "2025-10-20",
        milestone: "Milestone #1",
      },
      {
        id: "P-1002",
        scheme: "Clean Energy Incentive",
        amount: "₹8,00,000",
        amountEth: "1.85 ETH",
        status: "PENDING",
        txHash: null,
        processedDate: null,
        milestone: "Milestone #2",
      },
    ];

    // only set mock if API didn't set anything after short delay
    const t = setTimeout(() => {
      setPayments((prev) => (prev.length ? prev : mock));
    }, 300);

    return () => clearTimeout(t);
  }, []);

  if (!user) return null;

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
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const walletBalance = payments.reduce((acc, p) => {
    // this is illustrative; payments.amount is a string like '₹12,00,000'
    return acc;
  }, 0);

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Payments</h1>
            <p className="text-muted-foreground">
              Track your subsidy payments and wallet credits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">₹—</p>
                  <p className="text-sm text-muted-foreground">
                    Available Balance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {payments.filter((p) => p.status === "PENDING").length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pending Payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">
                    {payments.filter((p) => p.status === "COMPLETED").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {payments.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{p.scheme}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {p.id} • {p.milestone}
                    </p>
                  </div>
                  {getStatusBadge(p.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">{p.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.amountEth}
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
                          {p.contractAddress || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Milestone
                        </p>
                        <p className="text-sm">{p.milestone}</p>
                      </div>
                    </div>
                  </div>

                  {p.processedDate && (
                    <div className="text-sm text-muted-foreground">
                      Processed on{" "}
                      {new Date(p.processedDate).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {p.txHash && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${
                            import.meta.env.VITE_ETH_EXPLORER_BASE ||
                            "https://sepolia.etherscan.io"
                          }/tx/${p.txHash}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </a>
                      </Button>
                    )}

                    {p.status === "PENDING" && (
                      <Button
                        size="sm"
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                      >
                        Request Payout
                      </Button>
                    )}

                    {p.status === "COMPLETED" && (
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Wallet Credited Successfully
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Payments;
