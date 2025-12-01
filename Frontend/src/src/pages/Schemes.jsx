import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Schemes = () => {
  const { user, isLoading } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);
  useEffect(() => {
    import("@/services/api").then(({ apiClient }) => {
      apiClient
        .getProjects()
        .then((res) => {
          setSchemes(res || []);
        })
        .catch((e) => {
          console.error("Failed to fetch schemes", e);
        });
    });
  }, []);
  if (isLoading) return null;
  if (!user) return null;

  const displaySchemes = schemes.map((p) => ({
    id: p._id,
    name: p.title || p.name,
    description: p.description || "",
    status: p.status
      ? p.status === "approved"
        ? "ACTIVE"
        : p.status.toUpperCase()
      : "DRAFT",
    target:
      p.milestones && p.milestones.length
        ? `${p.milestones[0].requiredProduction || "—"}`
        : "—",
    subsidy: p.totalSubsidy ? `₹${p.totalSubsidy}` : "—",
    participants: p.participants || 0,
    startDate: p.createdAt,
    endDate: p.updatedAt,
  }));

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-success text-success-foreground">Active</Badge>
        );
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "CLOSED":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user.role === "GOV"
                ? "Manage Schemes"
                : user.role === "PRODUCER"
                ? "Available Schemes"
                : "Schemes"}
            </h1>
            <p className="text-muted-foreground">
              {user.role === "GOV"
                ? "Create and manage subsidy schemes"
                : user.role === "PRODUCER"
                ? "Browse and enroll in subsidy schemes"
                : "View all subsidy schemes"}
            </p>
          </div>
          {user.role === "GOV" && (
            <Button
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => navigate("/schemes/create")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Scheme
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search schemes..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid gap-6">
          {displaySchemes.length === 0 ? (
            <div className="text-center p-8 bg-card rounded-lg">
              <h3 className="text-lg font-semibold">No schemes available</h3>
              <p className="text-sm text-muted-foreground">
                There are no subsidy schemes to display right now.
              </p>
            </div>
          ) : (
            displaySchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{scheme.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ID: {scheme.id}
                      </p>
                    </div>
                    {getStatusBadge(scheme.status)}
                  </div>
                  <p className="text-muted-foreground">{scheme.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Target</p>
                        <p className="font-medium">{scheme.target}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Subsidy</p>
                        <p className="font-medium">{scheme.subsidy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Participants
                        </p>
                        <p className="font-medium">{scheme.participants}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-medium text-xs">
                          {new Date(scheme.startDate).toLocaleDateString()} -{" "}
                          {new Date(scheme.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/schemes/${scheme.id}`)}
                    >
                      View Details
                    </Button>
                    {user.role === "PRODUCER" && scheme.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                        onClick={() => navigate(`/schemes/${scheme.id}/enroll`)}
                      >
                        Enroll Now
                      </Button>
                    )}
                    {user.role === "GOV" && (
                      <>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {scheme.status === "DRAFT" && (
                          <Button
                            size="sm"
                            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                          >
                            Activate
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

// Default export for compatibility with default imports/re-exports
export default Schemes;
