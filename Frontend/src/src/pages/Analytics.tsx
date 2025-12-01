import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/services/api';

const Analytics = () => {
  const [counts, setCounts] = useState({ projects: 0, submissions: 0, verified: 0 });

  useEffect(() => {
    (async () => {
      try {
        const projects = await apiClient.getProjects().catch(() => []);
        const submissions = await apiClient.getSubmissions().catch(() => []);
        const verified = (submissions || []).filter((s:any) => (s.status && s.status.toLowerCase() === 'verified') || s.txHash).length;
        setCounts({ projects: (projects || []).length, submissions: (submissions || []).length, verified });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <Layout userRole={'GOV'} userName={''}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Quick platform metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{counts.projects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{counts.submissions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{counts.verified}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
