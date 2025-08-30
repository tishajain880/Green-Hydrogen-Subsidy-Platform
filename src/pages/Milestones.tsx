import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Plus, 
  Calendar,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Milestones = () => {
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

  const mockMilestones = [
    {
      id: "MS-001",
      schemeId: "SCH-1001",
      schemeName: "Green H₂ Scale-Up Phase 1",
      producer: "HydroCorp Ltd",
      target: 1000,
      achieved: 850,
      unit: "kg",
      submittedDate: "2024-12-15",
      status: "APPROVED",
      verifiedBy: "Dr. Smith",
      proofUrl: "proof-doc-1.pdf",
      reward: "₹12L"
    },
    {
      id: "MS-002",
      schemeId: "SCH-1002",
      schemeName: "Clean Energy Incentive",
      producer: "EcoHydrogen Pvt",
      target: 500,
      achieved: 300,
      unit: "kg",
      submittedDate: "2024-12-10",
      status: "PENDING",
      verifiedBy: null,
      proofUrl: "proof-doc-2.pdf",
      reward: "₹8L"
    },
    {
      id: "MS-003",
      schemeId: "SCH-1001",
      schemeName: "Green H₂ Scale-Up Phase 1",
      producer: "GreenFuel Industries",
      target: 1000,
      achieved: 1200,
      unit: "kg",
      submittedDate: "2024-12-05",
      status: "APPROVED",
      verifiedBy: "Dr. Johnson",
      proofUrl: "proof-doc-3.pdf",
      reward: "₹15L"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "PENDING":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "REJECTED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMilestones = user.role === "PRODUCER" 
    ? mockMilestones.filter(m => m.producer === "HydroCorp Ltd") // Simulate user's milestones
    : mockMilestones;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user.role === "PRODUCER" ? "My Milestones" : 
               user.role === "AUDITOR" ? "Milestone Verifications" : "Milestones"}
            </h1>
            <p className="text-muted-foreground">
              {user.role === "PRODUCER" ? "Track your progress and submit new milestones" :
               user.role === "AUDITOR" ? "Review and verify milestone submissions" :
               "Monitor milestone progress across all schemes"}
            </p>
          </div>
          {user.role === "PRODUCER" && (
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Milestone
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {filteredMilestones.map((milestone) => (
            <Card key={milestone.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{milestone.schemeName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.role !== "PRODUCER" && `Producer: ${milestone.producer} • `}
                      Milestone ID: {milestone.id}
                    </p>
                  </div>
                  {getStatusBadge(milestone.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="font-medium">
                          {milestone.achieved} / {milestone.target} {milestone.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-medium">
                          {new Date(milestone.submittedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Potential Reward</p>
                        <p className="font-medium">{milestone.reward}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.min(100, Math.round((milestone.achieved / milestone.target) * 100))}%</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (milestone.achieved / milestone.target) * 100)} 
                      className="h-2"
                    />
                  </div>

                    {milestone.verifiedBy && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verified by {milestone.verifiedBy}</span>
                      </div>
                    )}

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      View Proof
                    </Button>
                    {user.role === "AUDITOR" && milestone.status === "PENDING" && (
                      <>
                        <Button size="sm" className="bg-success text-success-foreground hover:opacity-90">
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm">
                          Reject
                        </Button>
                      </>
                    )}
                    {user.role === "PRODUCER" && milestone.status === "REJECTED" && (
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                        Resubmit
                      </Button>
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