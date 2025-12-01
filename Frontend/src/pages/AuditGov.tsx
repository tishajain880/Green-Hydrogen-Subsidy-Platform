import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/services/api";

const AuditGov = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading: qLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => apiClient.getAuditLogs(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    setEvents(logs || []);
    setLoading(false);
  }, [logs]);

  // SSE subscription to audit logs
  useEffect(() => {
    const base = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
    ).replace(/\/api\/?$/, "");
    const url = `${base}/api/stream/audit-logs`;
    let es;
    try {
      es = new EventSource(url);
      es.addEventListener("audit_log", () =>
        queryClient.invalidateQueries(["auditLogs"])
      );
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

  return (
    <Layout userRole={"GOV"} userName={""}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Recent submissions and notifications
          </p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No audit events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No audit events found yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((e: any) => (
            <Card key={e._id || e.id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle>
                  {e.title || (e.project && e.project.title) || "Event"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {e.message || e.status || ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(
                    e.createdAt || e.createdAt || Date.now()
                  ).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AuditGov;
