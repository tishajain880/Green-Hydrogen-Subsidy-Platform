import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const SettlementBank = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const queryClient = useQueryClient();
  // SSE subscription to keep submission list realtime
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
        try {
          es.close();
        } catch (e) {}
      };
    } catch (e) {}
    return () => {
      try {
        es && es.close();
      } catch (e) {}
    };
  }, [queryClient]);
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => apiClient.getSubmissions(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    const pending = (subs || []).filter(
      (s: any) => s.status === "verified" && !s.settled
    );
    setItems(pending);
    setLoading(false);
  }, [subs]);

  const release = async (id: string) => {
    try {
      // In real system, bank would perform transfer and include settlementTx
      const resp = await apiClient.settleSubmission(id, { settlementTx: null });
      toast({ title: "Released", description: "Funds marked as released" });
      // invalidate submissions so UI refreshes
      queryClient.invalidateQueries(["submissions"]);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: e?.message || "Failed to release funds",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout userRole={"BANK"} userName={""}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Settlement Bank — Pending Releases
          </h1>
          <p className="text-muted-foreground">
            Approve and record disbursements for verified milestones
          </p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No pending releases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                There are no verified milestones awaiting settlement.
              </p>
            </CardContent>
          </Card>
        ) : (
          items.map((s) => (
            <Card key={s._id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle>Submission #{s._id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  Project: {s.project && (s.project.title || s.project._id)}
                </div>
                <div>
                  Producer:{" "}
                  {s.producer && (s.producer.name || s.producer.email)}
                </div>
                <div className="mt-2">
                  <Button
                    className="bg-gradient-primary text-primary-foreground"
                    onClick={() => release(s._id)}
                  >
                    Mark as Released
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default SettlementBank;
