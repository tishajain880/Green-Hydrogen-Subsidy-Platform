import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const CreateScheme = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      const userData = JSON.parse(session);
      setUser(userData);
      if (userData.role !== "GOV") {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    milestoneUnit: "",
    targetValue: "",
    subsidyAmount: "",
    startDate: "",
    endDate: "",
    eligibilityCriteria: "",
    termsAndConditions: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.description || !formData.targetValue || !formData.subsidyAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate saving
    toast({
      title: "Success",
      description: "Scheme created successfully!",
    });

    // Navigate back to schemes page
    setTimeout(() => {
      navigate("/schemes");
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) return null;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/schemes")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Schemes
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Scheme</h1>
            <p className="text-muted-foreground">Design a new subsidy scheme for green hydrogen producers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Scheme Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., Green H₂ Scale-Up Phase 2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="milestoneUnit">Milestone Unit</Label>
                      <Select value={formData.milestoneUnit} onValueChange={(value) => handleInputChange("milestoneUnit", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="tonnes">Tonnes</SelectItem>
                          <SelectItem value="mwh">MWh</SelectItem>
                          <SelectItem value="projects">Projects</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the scheme objectives and benefits..."
                      className="min-h-24"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetValue">Target Value *</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        value={formData.targetValue}
                        onChange={(e) => handleInputChange("targetValue", e.target.value)}
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subsidyAmount">Subsidy Amount (₹) *</Label>
                      <Input
                        id="subsidyAmount"
                        type="number"
                        value={formData.subsidyAmount}
                        onChange={(e) => handleInputChange("subsidyAmount", e.target.value)}
                        placeholder="e.g., 1500000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                    <Textarea
                      id="eligibilityCriteria"
                      value={formData.eligibilityCriteria}
                      onChange={(e) => handleInputChange("eligibilityCriteria", e.target.value)}
                      placeholder="Define who can participate in this scheme..."
                      className="min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                    <Textarea
                      id="termsAndConditions"
                      value={formData.termsAndConditions}
                      onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                      placeholder="Specify terms and conditions..."
                      className="min-h-20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheme Name</p>
                    <p className="font-medium">{formData.name || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-medium">
                      {formData.targetValue ? `${formData.targetValue} ${formData.milestoneUnit || "units"}` : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subsidy</p>
                    <p className="font-medium">
                      {formData.subsidyAmount ? `₹${parseInt(formData.subsidyAmount).toLocaleString()}` : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-sm">
                      {formData.startDate && formData.endDate 
                        ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
                        : "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Scheme
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/schemes")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};