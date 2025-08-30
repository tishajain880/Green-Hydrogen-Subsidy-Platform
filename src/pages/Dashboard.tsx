import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Target,
  Wallet,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
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

  const renderGovernmentDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Government Dashboard</h1>
          <p className="text-muted-foreground">Manage subsidy schemes and monitor green hydrogen progress</p>
        </div>
        <Button 
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => navigate("/schemes/create")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Scheme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Schemes"
          value={12}
          subtitle="₹2.4Cr total allocated"
          icon={FileText}
          variant="success"
          trend={{ value: 8, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Registered Producers"
          value={47}
          subtitle="23 verified this month"
          icon={Users}
          variant="default"
          trend={{ value: 15, label: "new registrations", isPositive: true }}
        />
        <StatsCard
          title="Total Disbursed"
          value="₹1.2Cr"
          subtitle="Across 156 milestones"
          icon={DollarSign}
          variant="success"
          trend={{ value: 22, label: "this quarter", isPositive: true }}
        />
        <StatsCard
          title="Pending Verifications"
          value={8}
          subtitle="Awaiting auditor review"
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Scheme Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { scheme: "Green H₂ Scale-Up Phase 1", producer: "HydroCorp Ltd", status: "milestone_completed", amount: "₹12L" },
                { scheme: "Clean Energy Incentive", producer: "EcoHydrogen Pvt", status: "verification_pending", amount: "₹8L" },
                { scheme: "Industrial H₂ Subsidy", producer: "GreenFuel Industries", status: "disbursed", amount: "₹15L" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.scheme}</div>
                    <div className="text-sm text-muted-foreground">{item.producer}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={item.status === 'disbursed' ? 'default' : 'secondary'}
                      className={item.status === 'milestone_completed' ? 'bg-success text-success-foreground' : ''}
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <span className="font-medium">{item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/schemes/create")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Subsidy Scheme
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/schemes")}
            >
              <Users className="w-4 h-4 mr-2" />
              Review Producer Applications
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/disbursements")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Disbursements
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/audit")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProducerDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Producer Dashboard</h1>
          <p className="text-muted-foreground">Track your hydrogen production and subsidy milestones</p>
        </div>
        <Button 
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => navigate("/milestones")}
        >
          <Target className="w-4 h-4 mr-2" />
          Submit Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Schemes"
          value={3}
          subtitle="₹45L total eligible"
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Production This Month"
          value="1,247 kg"
          subtitle="Target: 1,500 kg"
          icon={Target}
          variant="success"
          trend={{ value: 83, label: "of target", isPositive: true }}
        />
        <StatsCard
          title="Subsidies Earned"
          value="₹28L"
          subtitle="4 milestones completed"
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="Wallet Balance"
          value="2.35 ETH"
          subtitle="Sepolia testnet"
          icon={Wallet}
          variant="default"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Green H₂ Scale-Up", progress: 85, target: "1000 kg", current: "850 kg", reward: "₹15L" },
                { name: "Clean Energy Incentive", progress: 60, target: "500 kg", current: "300 kg", reward: "₹8L" },
                { name: "Industrial H₂ Subsidy", progress: 95, target: "2000 kg", current: "1900 kg", reward: "₹22L" },
              ].map((scheme, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{scheme.name}</div>
                    <Badge className="bg-primary/10 text-primary">{scheme.reward}</Badge>
                  </div>
                  <Progress value={scheme.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{scheme.current} / {scheme.target}</span>
                    <span>{scheme.progress}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Dec 15", production: "245 kg", status: "verified", reward: "₹3L" },
                { date: "Dec 10", production: "198 kg", status: "pending", reward: "₹2.4L" },
                { date: "Dec 5", production: "267 kg", status: "verified", reward: "₹3.2L" },
                { date: "Nov 30", production: "189 kg", status: "verified", reward: "₹2.3L" },
              ].map((milestone, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{milestone.production}</div>
                    <div className="text-sm text-muted-foreground">{milestone.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={milestone.status === 'verified' ? 'default' : 'secondary'}
                      className={milestone.status === 'verified' ? 'bg-success text-success-foreground' : ''}
                    >
                      {milestone.status}
                    </Badge>
                    <span className="font-medium text-sm">{milestone.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAuditorDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auditor Dashboard</h1>
          <p className="text-muted-foreground">Verify production milestones and ensure compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Verifications"
          value={12}
          subtitle="Require your review"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Completed This Week"
          value={28}
          subtitle="Average time: 2.3 hours"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Total Verified"
          value={347}
          subtitle="₹4.2Cr in subsidies"
          icon={Target}
          variant="default"
        />
        <StatsCard
          title="Rejection Rate"
          value="3.2%"
          subtitle="Below industry average"
          icon={AlertCircle}
          variant="success"
        />
      </div>
    </div>
  );

  const renderBankDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Dashboard</h1>
          <p className="text-muted-foreground">Process settlements and manage disbursements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Settlements"
          value={8}
          subtitle="₹1.2Cr to process"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Processed Today"
          value="₹45L"
          subtitle="23 transactions"
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="Total Volume"
          value="₹12.8Cr"
          subtitle="This quarter"
          icon={TrendingUp}
          variant="default"
        />
        <StatsCard
          title="Success Rate"
          value="99.8%"
          subtitle="Transaction reliability"
          icon={CheckCircle}
          variant="success"
        />
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (user.role) {
      case "GOV": return renderGovernmentDashboard();
      case "PRODUCER": return renderProducerDashboard();
      case "AUDITOR": return renderAuditorDashboard();
      case "BANK": return renderBankDashboard();
      default: return <div>Invalid role</div>;
    }
  };

  return (
    <Layout userRole={user.role} userName={user.name}>
      {getDashboardContent()}
    </Layout>
  );
};