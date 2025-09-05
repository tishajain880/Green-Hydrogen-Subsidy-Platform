import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Edit, DollarSign } from "lucide-react";

const mockSchemes = [
  {
    id: "SCH-1001",
    name: "Green H2 Scale-Up Initiative",
    description: "Support green hydrogen production scaling",
    targetValue: 1000,
    unit: "kg",
    subsidyAmount: "1.0 ETH",
    status: "ACTIVE",
    applications: 12,
    funded: true
  },
  {
    id: "SCH-1002", 
    name: "Clean Energy Transition",
    description: "Accelerate renewable energy adoption",
    targetValue: 500,
    unit: "MWh",
    subsidyAmount: "2.5 ETH",
    status: "DRAFT",
    applications: 0,
    funded: false
  },
  {
    id: "SCH-1003",
    name: "Industrial Decarbonization",
    description: "Reduce industrial carbon emissions",
    targetValue: 50,
    unit: "plants",
    subsidyAmount: "5.0 ETH",
    status: "ACTIVE",
    applications: 8,
    funded: true
  }
];

export const Schemes = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ACTIVE": return "default";
      case "DRAFT": return "secondary";
      case "COMPLETED": return "outline";
      default: return "secondary";
    }
  };

  return (
    <Layout userRole="GOV" userName="Government Official">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Subsidy Schemes</h1>
          <Button 
            onClick={() => navigate("/create-scheme")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Scheme
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Manage Schemes</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search schemes..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSchemes.map((scheme) => (
                <Card key={scheme.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{scheme.name}</h3>
                        <Badge variant={getStatusColor(scheme.status)}>
                          {scheme.status}
                        </Badge>
                        {scheme.funded && (
                          <Badge variant="outline" className="text-xs border-success text-success">
                            Funded
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{scheme.description}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Target: {scheme.targetValue} {scheme.unit}</span>
                        <span>Subsidy: {scheme.subsidyAmount}</span>
                        <span>Applications: {scheme.applications}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {!scheme.funded && (
                        <Button variant="default" size="sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Fund
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};