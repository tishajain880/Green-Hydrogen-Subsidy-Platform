import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: '', requiredProduction: '', percent: '' });
  const { toast } = useToast();

  useEffect(() => {
    const s = localStorage.getItem('userSession');
    if (!s) return navigate('/login');
    setUser(JSON.parse(s));
  }, [navigate]);

  const loadScheme = async (projectId?: string) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getProject(projectId);
      setScheme(res);
    } catch (e) {
      console.error('Failed to load scheme', e);
      setScheme(null);
      setError('Failed to load scheme. It may not exist or you may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadScheme(id);
  }, [id]);

  if (!user) return null;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{scheme ? scheme.title : 'Scheme details'}</h1>
            <p className="text-muted-foreground">{scheme ? scheme.description : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'PRODUCER' && (
              <Button className="bg-gradient-primary text-primary-foreground" onClick={() => navigate(`/schemes/${id}/enroll`)}>
                Enroll Now
              </Button>
            )}
            {scheme && user.role === 'admin' && (
              <div className="flex items-center gap-2">
                <Button className="bg-gradient-primary text-primary-foreground" onClick={async () => {
                  try {
                    setRegistering(true);
                    const resp = await (await import('@/services/api')).apiClient.registerProjectOnChain(scheme._id);
                                                    const h = resp.txHash || resp.transactionHash || null;
                                                    setTxHash(h);
                    // refresh scheme data so UI shows chain fields
                    await loadScheme(scheme._id);
                  } catch (e) { console.error(e); setTxHash(null); }
                  finally { setRegistering(false); }
                }} disabled={registering}>
                  {registering ? 'Registering…' : 'Register on-chain'}
                </Button>
                {txHash && (
                  <div className="text-sm text-muted-foreground">
                    Registered — TX: <a target="_blank" rel="noreferrer" className="underline" href={`${(import.meta.env.VITE_ETH_EXPLORER_BASE || 'https://sepolia.etherscan.io')}/tx/${txHash}`}>{txHash}</a>
                  </div>
                )}
                {(scheme && (user.role === 'admin' || user.role === 'GOV' || user.role === 'MILESTONE_EDITOR')) && (
                  <Button variant="outline" onClick={() => setEditing(true)}>Edit Milestones</Button>
                )}
              </div>
            )}
            {scheme && user.role === 'admin' && scheme.status === 'submitted' && (
              <>
                <Button variant="outline" onClick={async () => {
                  try { await (await import('@/services/api')).apiClient.makeProjectDecision(scheme._id, 'approved'); alert('Approved'); window.location.reload(); } catch (e) { console.error(e); }
                }}>Approve</Button>
                <Button variant="destructive" onClick={async () => {
                  try { await (await import('@/services/api')).apiClient.makeProjectDecision(scheme._id, 'rejected'); alert('Rejected'); window.location.reload(); } catch (e) { console.error(e); }
                }}>Reject</Button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div>Loading project…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : scheme ? (
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div><strong>Subsidy:</strong> {scheme.totalSubsidy ? `₹${scheme.totalSubsidy}` : '—'}</div>
                <div><strong>Milestones:</strong> {scheme.milestones ? scheme.milestones.length : 0}</div>
                <div><strong>Status:</strong> {scheme.status}</div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <Dialog open={editing} onOpenChange={(open) => setEditing(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Milestones</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(scheme && scheme.milestones && scheme.milestones.length) ? (
              scheme.milestones.map((m:any, idx:number) => (
                <div key={idx} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">Required: {m.requiredProduction}</div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={async () => {
                      // simple edit: prompt for name (could be replaced with inline form)
                      const name = window.prompt('Edit milestone name', m.name || m.title);
                      if (!name) return;
                      try {
                        await apiClient.editMilestone(scheme._id, idx, { title: name, name });
                        await loadScheme(scheme._id);
                        toast({ title: 'Updated', description: 'Milestone updated' });
                      } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to update milestone', variant: 'destructive' }); }
                    }}>Edit</Button>
                  </div>
                </div>
              ))
            ) : (
              <div>No milestones</div>
            )}

            <div className="pt-2 border-t">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <Label>Milestone Name</Label>
                  <Input value={newMilestone.name} onChange={(e:any) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Required Production</Label>
                  <Input type="number" value={newMilestone.requiredProduction} onChange={(e:any) => setNewMilestone(prev => ({ ...prev, requiredProduction: e.target.value }))} />
                </div>
                <div>
                  <Label>Percent</Label>
                  <Input type="number" value={newMilestone.percent} onChange={(e:any) => setNewMilestone(prev => ({ ...prev, percent: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                    <Button onClick={async () => {
                    if (!newMilestone.name) { toast({ title: 'Validation', description: 'Name required', variant: 'destructive' }); return; }
                    try {
                      await apiClient.addMilestone(scheme._id, { title: newMilestone.name, name: newMilestone.name, requiredProduction: Number(newMilestone.requiredProduction || 0), percent: Number(newMilestone.percent || 0) });
                      setNewMilestone({ name: '', requiredProduction: '', percent: '' });
                      await loadScheme(scheme._id);
                      toast({ title: 'Added', description: 'Milestone added' });
                    } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to add milestone', variant: 'destructive' }); }
                  }}>Add Milestone</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SchemeDetails;
