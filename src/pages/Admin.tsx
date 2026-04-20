import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Briefcase, FileText, Shield, Plus, Trash2, Youtube, MessageSquare } from "lucide-react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export default function Admin() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const [ytDialog, setYtDialog] = useState(false);
  const [ytForm, setYtForm] = useState({ title: "", url: "", description: "", category: "geral" });

  const [testDialog, setTestDialog] = useState(false);
  const [testForm, setTestForm] = useState({ name: "", content: "", company: "", role: "", rating: 5 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: jobCount } = await supabase.from("jobs").select("*", { count: "exact", head: true });
    const { count: appCount } = await supabase.from("applications").select("*", { count: "exact", head: true });
    setStats({ users: userCount || 0, jobs: jobCount || 0, applications: appCount || 0 });

    const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
    setUsers(usersData || []);

    const { data: jobsData } = await supabase.from("jobs").select("*, company:companies(company_name)").order("posted_at", { ascending: false }).limit(50);
    setJobs((jobsData || []).map((j: any) => ({ ...j, company: Array.isArray(j.company) ? j.company[0] : j.company })));

    const { data: ytData } = await supabase.from("youtube_links").select("*").order("sort_order");
    setYoutubeLinks(ytData || []);

    const { data: testData } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setTestimonials(testData || []);
  };

  if (profile?.user_type !== "admin") return <Navigate to="/" replace />;

  const deleteJob = async (id: string) => {
    await supabase.from("jobs").delete().eq("id", id);
    toast.success("Vaga removida");
    loadData();
  };

  const addYoutubeLink = async () => {
    await supabase.from("youtube_links").insert({ title: ytForm.title, url: ytForm.url, description: ytForm.description, category: ytForm.category, sort_order: youtubeLinks.length });
    toast.success("Vídeo adicionado!");
    setYtDialog(false);
    setYtForm({ title: "", url: "", description: "", category: "geral" });
    loadData();
  };

  const deleteYoutubeLink = async (id: string) => {
    await supabase.from("youtube_links").delete().eq("id", id);
    toast.success("Vídeo removido");
    loadData();
  };

  const addTestimonial = async () => {
    await supabase.from("testimonials").insert({ name: testForm.name, content: testForm.content, company: testForm.company, role: testForm.role, rating: testForm.rating });
    toast.success("Depoimento adicionado!");
    setTestDialog(false);
    setTestForm({ name: "", content: "", company: "", role: "", rating: 5 });
    loadData();
  };

  const deleteTestimonial = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Depoimento removido");
    loadData();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Painel Admin — Trampo</h1>
            <p className="text-xs text-muted-foreground">Gestão completa da plataforma</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Usuários", value: stats.users, icon: Users },
            { label: "Vagas", value: stats.jobs, icon: Briefcase },
            { label: "Candidaturas", value: stats.applications, icon: FileText },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <s.icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-3xl font-bold font-display">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="jobs">Vagas</TabsTrigger>
            <TabsTrigger value="youtube">Vídeos</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Usuários Cadastrados</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded border p-3 text-sm">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email} · CPF: {u.cpf || "N/A"}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{u.user_type}</span>
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">{u.plan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader><CardTitle>Gerenciar Vagas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between rounded border p-3 text-sm">
                      <div>
                        <p className="font-medium">{j.title}</p>
                        <p className="text-xs text-muted-foreground">{j.company?.company_name} · {j.city}, {j.state} · {j.status}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteJob(j.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="youtube">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Youtube className="h-5 w-5 text-destructive" /> Vídeos</CardTitle>
                <Dialog open={ytDialog} onOpenChange={setYtDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Vídeo</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Título</Label><Input value={ytForm.title} onChange={(e) => setYtForm({ ...ytForm, title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>URL do YouTube</Label><Input value={ytForm.url} onChange={(e) => setYtForm({ ...ytForm, url: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Descrição</Label><Input value={ytForm.description} onChange={(e) => setYtForm({ ...ytForm, description: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Categoria</Label><Input value={ytForm.category} onChange={(e) => setYtForm({ ...ytForm, category: e.target.value })} /></div>
                      <Button onClick={addYoutubeLink} className="w-full">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {youtubeLinks.map((yt) => (
                    <div key={yt.id} className="flex items-center justify-between rounded border p-3 text-sm">
                      <div>
                        <p className="font-medium">{yt.title}</p>
                        <p className="text-xs text-muted-foreground">{yt.category}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteYoutubeLink(yt.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {youtubeLinks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum vídeo cadastrado.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Depoimentos</CardTitle>
                <Dialog open={testDialog} onOpenChange={setTestDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Depoimento</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Nome</Label><Input value={testForm.name} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Cargo</Label><Input value={testForm.role} onChange={(e) => setTestForm({ ...testForm, role: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Empresa</Label><Input value={testForm.company} onChange={(e) => setTestForm({ ...testForm, company: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Depoimento</Label><Textarea rows={3} value={testForm.content} onChange={(e) => setTestForm({ ...testForm, content: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Avaliação (1-5)</Label><Input type="number" min={1} max={5} value={testForm.rating} onChange={(e) => setTestForm({ ...testForm, rating: Number(e.target.value) })} /></div>
                      <Button onClick={addTestimonial} className="w-full">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testimonials.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded border p-3 text-sm">
                      <div>
                        <p className="font-medium">{t.name} - {t.role}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.content}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTestimonial(t.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {testimonials.length === 0 && <p className="text-sm text-muted-foreground">Nenhum depoimento.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
