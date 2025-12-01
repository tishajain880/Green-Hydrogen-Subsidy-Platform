import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export const EnrollPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [scheme, setScheme] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [totalSubsidy, setTotalSubsidy] = useState<number | ''>('');

  useEffect(() => {
    const s = localStorage.getItem('userSession');
    if (!s) return navigate('/login');
    setUser(JSON.parse(s));
  }, [navigate]);

  useEffect(() => {
    if (!id) return;
    apiClient.getProject(id).then((res) => {
      setScheme(res);
      setTitle(res.title ? res.title + ' - Enrollment' : 'Enrollment');
      setDescription(`Enrollment for ${res.title}`);
      setTotalSubsidy(res.totalSubsidy || '');
    }).catch(() => {});
  }, [id]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files;
    if (!f) return;
    setFiles(Array.from(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title,
        description,
        totalSubsidy: totalSubsidy ? Number(totalSubsidy) : undefined,
        milestones: scheme && scheme.milestones ? scheme.milestones : undefined,
        attachments: files
      };

      // submit enrollment via enroll endpoint
      const fd = new FormData();
      fd.append('title', payload.title || 'Enrollment');
      fd.append('description', payload.description || '');
      if (payload.attachments) payload.attachments.forEach((f: File) => fd.append('attachments', f));

      await apiClient.enrollProject(id, { title: payload.title, description: payload.description, attachments: payload.attachments });
      toast({ title: 'Enrolled', description: 'Your enrollment has been submitted and is pending approval.' });
      navigate('/dashboard');
    } catch (err:any) {
      toast({ title: 'Error', description: err.message || 'Failed to enroll', variant: 'destructive' });
    }
  };

  if (!user) return null;

  return (
    <Layout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Enroll in Scheme</h1>
            <p className="text-muted-foreground">Fill details and upload documents to enroll</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Upload Documents (proofs, certifications)</Label>
                  <Input type="file" multiple onChange={handleFiles} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Scheme</p>
                  <p className="font-medium">{scheme ? scheme.title : '—'}</p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">Subsidy</p>
                  <p className="font-medium">{totalSubsidy ? `₹${totalSubsidy}` : '—'}</p>
                </div>
                <div className="mt-4">
                  <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">Submit Enrollment</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EnrollPage;
