import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/services/api';

const Producers = () => {
  const [producers, setProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch users with role=PRODUCER from backend
        const res = await apiClient.request('/users?role=PRODUCER');
        const list = Array.isArray(res) ? res : [];
        const items = list.map((u:any) => ({ id: u._id || u.id, name: u.name, email: u.email }));
        setProducers(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout userRole={'GOV'} userName={''}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Producers</h1>
            <p className="text-muted-foreground">List of hydrogen producers registered in the system</p>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : producers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No producers found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">There are no producers yet. Producers will appear here once they register or submit projects.</p>
            </CardContent>
          </Card>
        ) : (
          producers.map(p => (
            <Card key={p.id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle>{p.name || 'Unnamed'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">{p.email}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Producers;
