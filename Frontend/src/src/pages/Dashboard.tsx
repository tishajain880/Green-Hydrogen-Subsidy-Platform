export { default } from "./Dashboard.jsx";
export * from "./Dashboard.jsx";
import { apiClient } from "@/services/api";

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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage subsidy schemes and monitor green hydrogen progress
          </p>
        </div>
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
                {
                  scheme: "Green H₂ Scale-Up Phase 1",
                  producer: "HydroCorp Ltd",
                  status: "milestone_completed",
                  amount: "₹12L",
                },
                {
                  scheme: "Clean Energy Incentive",
                  producer: "EcoHydrogen Pvt",
                  status: "verification_pending",
                  amount: "₹8L",
                },
                {
                  scheme: "Industrial H₂ Subsidy",
                  producer: "GreenFuel Industries",
                  status: "disbursed",
                  amount: "₹15L",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{item.scheme}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.producer}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.status === "disbursed" ? "default" : "secondary"
                      }
                      className={
                        item.status === "milestone_completed"
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {item.status.replace("_", " ")}
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

  const renderProducerDashboard = () => <ProducerDashboard />;

  const renderMilestoneEditorDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Milestone Editor</h1>
          <p className="text-muted-foreground">
            Create and edit milestone templates for schemes
          </p>
        </div>
        <Button
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => navigate("/schemes")}
        >
          Manage Schemes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Editable Schemes"
          value={8}
          subtitle="Schemes with editable milestones"
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Draft Milestones"
          value={14}
          subtitle="Pending publication"
          icon={Target}
          variant="warning"
        />
        <StatsCard
          title="Published"
          value={42}
          subtitle="Active milestones"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Recently Updated"
          value={3}
          subtitle="This week"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Milestone Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder list: real data will come from API when wired */}
              <div className="p-3 border rounded-lg">
                Updated milestone template for{" "}
                <strong>Green H₂ Scale-Up Phase 1</strong>
              </div>
              <div className="p-3 border rounded-lg">
                Created draft milestone for{" "}
                <strong>Industrial H₂ Subsidy</strong>
              </div>
              <div className="p-3 border rounded-lg">
                Published milestone for <strong>Clean Energy Incentive</strong>
              </div>
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
              onClick={() => navigate("/schemes")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Manage Schemes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/milestones")}
            >
              <Target className="w-4 h-4 mr-2" />
              Edit Milestones
            </Button>
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
          <p className="text-muted-foreground">
            Verify production milestones and ensure compliance
          </p>
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
          <p className="text-muted-foreground">
            Process settlements and manage disbursements
          </p>
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
      case "GOV":
        return renderGovernmentDashboard();
      case "admin":
        return renderGovernmentDashboard();
      case "PRODUCER":
        return renderProducerDashboard();
      case "AUDITOR":
        return renderAuditorDashboard();
      case "BANK":
        return renderBankDashboard();
      case "MILESTONE_EDITOR":
        return renderMilestoneEditorDashboard();
      case "milestone_editor":
        return renderMilestoneEditorDashboard();
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <Layout userRole={user.role} userName={user.name}>
      {getDashboardContent()}
    </Layout>
  );
};

// New: ProducerDashboard component uses real projects from API
const ProducerDashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("userSession") || "null");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch approved projects (open for enrollment) and user's own projects
        const [approvedRes, myRes] = await Promise.allSettled([
          apiClient.getApprovedProjects(),
          apiClient.getProjects(),
        ]);
        const approved =
          approvedRes.status === "fulfilled" && Array.isArray(approvedRes.value)
            ? approvedRes.value
            : [];
        const mine =
          myRes.status === "fulfilled" && Array.isArray(myRes.value)
            ? myRes.value
            : [];

        // Merge by _id, prefer mine entries for ownership fields
        const map = new Map();
        for (const p of approved) map.set(p._id || p.id || p, p);
        for (const p of mine) map.set(p._id || p.id || p, p);
        const merged = Array.from(map.values());
        if (!mounted) return;
        setProjects(merged);
      } catch (e) {
        console.error("Failed to load projects for producer dashboard", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Producer Dashboard</h1>
          <p className="text-muted-foreground">
            Track schemes you can enroll in and your own schemes
          </p>
        </div>
        <Button
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => navigate("/milestones")}
        >
          <Target className="w-4 h-4 mr-2" />
          Submit Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Analytics cards for producer */}
        <StatsCard
          title="Available Schemes"
          value={projects.filter((p) => p.status === "approved" || p.status === "active").length}
          subtitle="Open for enrollment"
          icon={FileText}
        />
        <StatsCard
          title="My Enrollments"
          value={projects.filter((p) => {
            const ownerId = p.owner && (p.owner._id || p.owner.id || p.owner);
            return ownerId && String(ownerId) === String(user && user.id);
          }).length}
          subtitle="Schemes you own"
          icon={Users}
        />
        <StatsCard
          title="Total Milestones"
          value={projects.reduce((acc, p) => acc + (Array.isArray(p.milestones) ? p.milestones.length : 0), 0)}
          subtitle="Across visible schemes"
          icon={Target}
        />
        {loading ? (
          <div>Loading projects…</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No schemes available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No approved schemes found. Check back later or contact your
                administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          projects.map((p: any) => (
            <Card key={p._id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle>{p.title || p.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {p.description}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Milestones:{" "}
                    {Array.isArray(p.milestones) ? p.milestones.length : 0}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/schemes/${p._id}`)}
                    >
                      View
                    </Button>
                    {p.owner &&
                      String(p.owner._id || p.owner) !==
                        String(user && user.id) && (
                        <Button
                          size="sm"
                          className="bg-gradient-primary text-primary-foreground"
                          onClick={() => navigate(`/schemes/${p._id}/enroll`)}
                        >
                          Enroll
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
