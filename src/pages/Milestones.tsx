import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react";

const mockMilestones = [
  {
    id: "MS-001",
    schemeId: "SCH-1001",
    schemeName: "Green H2 Scale-Up Initiative",
    targetValue: 1000,
    currentValue: 850,
    unit: "kg",
    status: "PENDING_VERIFICATION",
    submittedAt: "2024-01-15",
    proofUrl: "https://example.com/proof.pdf",
    verifierComments: ""
  },
  {
    id: "MS-002",
    schemeId: "SCH-1001", 
    schemeName: "Green H2 Scale-Up Initiative",
    targetValue: 1000,
    currentValue: 1200,
    unit: "kg",
    status: "APPROVED",
    submittedAt: "2024-01-10",
    proofUrl: "https://example.com/proof2.pdf",
    verifierComments: "Excellent progress, targets exceeded"
  },
  {
    id: "MS-003",
    schemeId: "SCH-1003",
    schemeName: "Industrial Decarbonization",
    targetValue: 50,
    currentValue: 25,
    unit: "plants",
    status: "REJECTED",
    submittedAt: "2024-01-12",
    proofUrl: "https://example.com/proof3.pdf",
    verifierComments: "Insufficient documentation provided"
  }
];

export const Milestones = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="h-4 w-4 text-success" />;
      case "PENDING_VERIFICATION": return <Clock className="h-4 w-4 text-warning" />;
      case "REJECTED": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "APPROVED": return "default";
      case "PENDING_VERIFICATION": return "secondary"; 
      case "REJECTED": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <Layout userRole="PRODUCER" userName="Producer User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">My Milestones</h1>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Submit New Milestone
          </Button>
        </div>

        <div className="grid gap-6">
          {mockMilestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      {milestone.schemeName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Milestone ID: {milestone.id}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(milestone.status)}>
                    {milestone.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">
                        {milestone.currentValue} / {milestone.targetValue} {milestone.unit}
                      </p>
                      <Progress 
                        value={(milestone.currentValue / milestone.targetValue) * 100} 
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                      <p className="text-lg">{milestone.submittedAt}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion</p>
                      <p className="text-lg font-semibold text-primary">
                        {Math.min(100, Math.round((milestone.currentValue / milestone.targetValue) * 100))}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      View Proof Document
                    </Button>
                    {milestone.status === "REJECTED" && (
                      <Button size="sm" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Resubmit
                      </Button>
                    )}
                  </div>

                  {milestone.verifierComments && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Verifier Comments:
                      </p>
                      <p className="text-sm">{milestone.verifierComments}</p>
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