import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
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
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Milestones = () => {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    projectId: "",
    index: 0,
    productionValue: "",
    productionDate: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      setUser(JSON.parse(session));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadSubmissions = async () => {
      try {
        const res = await apiClient.getSubmissions();
        if (!mounted) return;
        setSubmissions(res || []);
      } catch (e) {
        // ignore
      }
    };

    const loadProjects = async () => {
      try {
        const session = localStorage.getItem("userSession");
        const u = session ? JSON.parse(session) : null;
        let res;
        if (u && u.role === "PRODUCER") {
          res = await apiClient.getApprovedProjects();
        } else {
          res = await apiClient.getProjects();
        }
        if (!mounted) return;
        setProjects(res || []);
      } catch (e) {
        // ignore
      }
    };

    loadSubmissions();
    loadProjects();

    let es = null;
    try {
      const sseUrl = `${apiClient.baseURL.replace(/\/$/, "")}/stream/projects`;
      es = new EventSource(sseUrl);
      es.addEventListener("project", () => {
        loadProjects();
      });
      es.addEventListener("error", () => {
        // SSE errored — keep polling
      });
    } catch (e) {
      es = null;
    }

    const poll = setInterval(() => {
      loadProjects();
      loadSubmissions();
    }, 5000);

    return () => {
      mounted = false;
      if (es) es.close();
      clearInterval(poll);
    };
  }, []);

  if (!user) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const allMilestones = user && user.milestones ? user.milestones : [];
  const filteredMilestones =
    user.role === "PRODUCER" ? allMilestones : allMilestones;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user.role === "PRODUCER"
                ? "My Milestones"
                : user.role === "AUDITOR"
                ? "Milestone Verifications"
                : "Milestones"}
            </h1>
            <p className="text-muted-foreground">
              {user.role === "PRODUCER"
                ? "Track your progress and submit new milestones"
                : user.role === "AUDITOR"
                ? "Review and verify milestone submissions"
                : "Monitor milestone progress across all schemes"}
            </p>
          </div>
          {(user.role === "PRODUCER" || user.role === "MILESTONE_EDITOR") && (
            <div className="flex gap-2">
              <Button
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {user.role === "PRODUCER"
                  ? "Submit New Milestone"
                  : "Create New Milestone Template"}
              </Button>
            </div>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Milestone</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const { validateMilestoneSubmission } = await import(
                      "@/lib/validators"
                    );
                    const validation = validateMilestoneSubmission(form);
                    if (!validation.ok) {
                      toast({
                        title: "Validation error",
                        description: validation.message,
                        variant: "destructive",
                      });
                      return;
                    }

                    const fd = new FormData();
                    if (form.productionValue)
                      fd.append(
                        "productionValue",
                        String(form.productionValue)
                      );
                    if (form.productionDate)
                      fd.append("productionDate", form.productionDate);
                    const files = document.getElementById("proofFiles")?.files;
                    if (files)
                      Array.from(files).forEach((f) =>
                        fd.append("attachments", f)
                      );
                    await (
                      await import("@/services/api")
                    ).apiClient.submitMilestone(form.projectId, form.index, fd);
                    setShowForm(false);
                    const res = await (
                      await import("@/services/api")
                    ).apiClient.getSubmissions();
                    setSubmissions(res || []);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm">Select Project</label>
                    <select
                      className="w-full"
                      value={form.projectId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          projectId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">-- choose project --</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm">Milestone Index</label>
                    <input
                      type="number"
                      className="w-full"
                      value={String(form.index)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          index: Number(e.target.value),
                        }))
                      }
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm">Production Value</label>
                    <input
                      type="number"
                      className="w-full"
                      value={String(form.productionValue)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          productionValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm">Production Date</label>
                    <input
                      type="date"
                      className="w-full"
                      value={form.productionDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          productionDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm">Proof Files</label>
                    <input
                      id="proofFiles"
                      type="file"
                      multiple
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {filteredMilestones.length === 0 ? (
            <div className="text-center p-8 bg-card rounded-lg">
              <h3 className="text-lg font-semibold">No milestones found</h3>
              <p className="text-sm text-muted-foreground">
                You have not submitted any milestones yet.
              </p>
            </div>
          ) : (
            filteredMilestones.map((milestone) => (
              <Card
                key={milestone.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {milestone.schemeName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {user.role !== "PRODUCER" &&
                          `Producer: ${milestone.producer} • `}
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
                          <p className="text-sm text-muted-foreground">
                            Progress
                          </p>
                          <p className="font-medium">
                            {milestone.achieved} / {milestone.target}{" "}
                            {milestone.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Submitted
                          </p>
                          <p className="font-medium">
                            {new Date(
                              milestone.submittedDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Potential Reward
                          </p>
                          <p className="font-medium">{milestone.reward}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(
                              (milestone.achieved / milestone.target) * 100
                            )
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (milestone.achieved / milestone.target) * 100
                        )}
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
                      {user.role === "admin" &&
                        milestone.status === "PENDING" &&
                        (() => {
                          const mIndex = Number(
                            milestone.index ??
                              milestone.milestoneIndex ??
                              milestone.id
                          );
                          const submission = submissions.find(
                            (s) =>
                              Number(s.milestoneIndex) === mIndex &&
                              (s.status || "").toLowerCase() === "pending"
                          );
                          if (!submission)
                            return (
                              <span className="text-sm text-muted-foreground">
                                No pending submission
                              </span>
                            );
                          const projectId =
                            submission.project &&
                            (submission.project._id || submission.project);
                          return (
                            <>
                              <Button
                                size="sm"
                                className="bg-success text-success-foreground hover:opacity-90"
                                disabled={processing}
                                onClick={async () => {
                                  try {
                                    setProcessing(true);
                                    await (
                                      await import("@/services/api")
                                    ).apiClient.verifyMilestone(
                                      projectId,
                                      submission.milestoneIndex,
                                      submission._id,
                                      "verified"
                                    );
                                    const res = await (
                                      await import("@/services/api")
                                    ).apiClient.getSubmissions();
                                    setSubmissions(res || []);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setProcessing(false);
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={processing}
                                onClick={async () => {
                                  try {
                                    setProcessing(true);
                                    await (
                                      await import("@/services/api")
                                    ).apiClient.verifyMilestone(
                                      projectId,
                                      submission.milestoneIndex,
                                      submission._id,
                                      "rejected"
                                    );
                                    const res = await (
                                      await import("@/services/api")
                                    ).apiClient.getSubmissions();
                                    setSubmissions(res || []);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setProcessing(false);
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          );
                        })()}
                      {user.role === "PRODUCER" &&
                        milestone.status === "REJECTED" && (
                          <Button
                            size="sm"
                            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                          >
                            Resubmit
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
    </Layout>
  );
};

// Default export to satisfy modules importing default
export default Milestones;
