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
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Schemes = () => {
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

  const mockSchemes = [
    {
      id: "SCH-1001",
      name: "Green H₂ Scale-Up Phase 1",
      description: "Support for scaling up green hydrogen production to industrial levels",
      status: "ACTIVE",
      target: "1000 kg",
      subsidy: "₹15L",
      participants: 23,
      startDate: "2024-01-15",
      endDate: "2024-12-31"
    },
    {
      id: "SCH-1002", 
      name: "Clean Energy Incentive",
      description: "Incentives for clean energy adoption in hydrogen production",
      status: "ACTIVE",
      target: "500 kg",
      subsidy: "₹8L",
      participants: 18,
      startDate: "2024-02-01",
      endDate: "2024-11-30"
    },
    {
      id: "SCH-1003",
      name: "Industrial H₂ Subsidy",
      description: "Large-scale industrial hydrogen production support",
      status: "DRAFT",
      target: "2000 kg",
      subsidy: "₹25L",
      participants: 0,
      startDate: "2024-04-01",
      endDate: "2025-03-31"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
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
              {user.role === "GOV" ? "Manage Schemes" : 
               user.role === "PRODUCER" ? "Available Schemes" : "Schemes"}
            </h1>
            <p className="text-muted-foreground">
              {user.role === "GOV" ? "Create and manage subsidy schemes" :
               user.role === "PRODUCER" ? "Browse and enroll in subsidy schemes" :
               "View all subsidy schemes"}
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
            <Input 
              placeholder="Search schemes..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid gap-6">
          {mockSchemes.map((scheme) => (
            <Card key={scheme.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{scheme.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {scheme.id}</p>
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
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="font-medium">{scheme.participants}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium text-xs">
                        {new Date(scheme.startDate).toLocaleDateString()} - {new Date(scheme.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {user.role === "PRODUCER" && scheme.status === "ACTIVE" && (
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                      Enroll Now
                    </Button>
                  )}
                  {user.role === "GOV" && (
                    <>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {scheme.status === "DRAFT" && (
                        <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                          Activate
                        </Button>
                      )}
                    </>
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