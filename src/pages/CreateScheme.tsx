import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreateScheme = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    milestoneUnit: "kg",
    targetValue: "",
    subsidyAmount: "",
    startDate: "",
    endDate: "",
    eligibilityCriteria: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate scheme creation
    toast({
      title: "Scheme Created Successfully",
      description: `${formData.name} has been created and is now active.`,
    });
    
    navigate("/schemes");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout userRole="GOV" userName="Government Official">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/schemes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schemes
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Create New Subsidy Scheme</h1>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Scheme Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Scheme Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Green H2 Scale-Up Initiative"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subsidyAmount">Subsidy Amount (ETH) *</Label>
                  <Input
                    id="subsidyAmount"
                    type="number"
                    step="0.001"
                    value={formData.subsidyAmount}
                    onChange={(e) => handleInputChange("subsidyAmount", e.target.value)}
                    placeholder="1.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milestoneUnit">Milestone Unit *</Label>
                  <Select value={formData.milestoneUnit} onValueChange={(value) => handleInputChange("milestoneUnit", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="mwh">MWh</SelectItem>
                      <SelectItem value="plants">Number of Plants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => handleInputChange("targetValue", e.target.value)}
                    placeholder="1000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the scheme objectives, target beneficiaries, and key requirements..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={(e) => handleInputChange("eligibilityCriteria", e.target.value)}
                  placeholder="Define who can apply for this scheme..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Create Scheme
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/schemes")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};