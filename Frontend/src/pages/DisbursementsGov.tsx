import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/services/api';

const DisbursementsGov = () => {
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const subs = await apiClient.getSubmissions().catch(() => []);
        // Filter verified submissions (have txHash) or those with status 'verified'
        const items = (subs || []).filter((s:any) => (s.status && s.status.toLowerCase() === 'verified') || s.txHash);
        setDisbursements(items);
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
            <h1 className="text-3xl font-bold">Disbursements</h1>
            <p className="text-muted-foreground">Payments and on-chain disbursements triggered by verified milestones</p>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : disbursements.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No disbursements found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No verified milestone disbursements found yet.</p>
            </CardContent>
          </Card>
        ) : (
          disbursements.map(d => (
            <Card key={d._id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle>Submission #{d._id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Project: {d.project && (d.project.title || d.project._id)}</div>
                <div className="text-sm">Status: {d.status}</div>
                {d.txHash && (
                  <div className="text-xs text-muted-foreground">Tx: <a target="_blank" rel="noreferrer" href={`${import.meta.env.VITE_ETH_EXPLORER_BASE || 'https://sepolia.etherscan.io'}/tx/${d.txHash}`}>{d.txHash}</a></div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default DisbursementsGov;
