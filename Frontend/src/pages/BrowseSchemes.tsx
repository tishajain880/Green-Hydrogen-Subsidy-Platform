import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const BrowseSchemes = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getApprovedProjects();
        setSchemes(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Failed to load approved schemes', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Browse Schemes</h1>
            <p className="text-muted-foreground">All approved schemes open for enrollment</p>
          </div>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : schemes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No approved schemes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No approved schemes are currently available for enrollment.</p>
            </CardContent>
          </Card>
        ) : (
          schemes.map((p:any) => (
            <Card key={p._id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">{p.description}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Milestones: {Array.isArray(p.milestones) ? p.milestones.length : 0}</div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => navigate(`/schemes/${p._id}`)}>View</Button>
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => navigate(`/schemes/${p._id}/enroll`)}>Enroll</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default BrowseSchemes;
