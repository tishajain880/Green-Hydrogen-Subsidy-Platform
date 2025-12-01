import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const MilestoneTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // For now, reuse getProjects and extract milestones as templates
        const projects = await apiClient.getProjects();
        const list: any[] = Array.isArray(projects) ? projects : [];
        const extracted: any[] = [];
        list.forEach((p) => {
          if (Array.isArray(p.milestones)) {
            p.milestones.forEach((m: any, idx: number) => {
              extracted.push({
                ...m,
                projectTitle: p.title,
                projectId: p._id,
                index: idx,
              });
            });
          }
        });
        if (!mounted) return;
        setTemplates(extracted);
      } catch (e) {
        console.error("Failed to load milestone templates", e);
        toast({
          title: "Error",
          description: "Unable to load milestone templates",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout userRole={undefined}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Milestone Templates</h1>
            <p className="text-muted-foreground">
              Create and manage milestone templates used across schemes
            </p>
          </div>
          <div>
            <Button className="bg-gradient-primary text-primary-foreground">
              New Template
            </Button>
          </div>
        </div>

        <div>
          {loading ? (
            <div>Loading…</div>
          ) : templates.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No templates found</CardTitle>
              </CardHeader>
              <CardContent>
                There are no milestone templates available.
              </CardContent>
            </Card>
          ) : (
            templates.map((t) => (
              <Card key={`${t.projectId}-${t.index}`} className="mb-3">
                <CardHeader>
                  <CardTitle>{t.title || `Milestone ${t.index + 1}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Project: {t.projectTitle}
                  </div>
                  <div className="mt-2">{t.description}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MilestoneTemplates;
