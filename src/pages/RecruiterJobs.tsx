import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Pause, XCircle } from "lucide-react";
import { toast } from "sonner";

const VECTOR_DIMENSIONS = ["technical", "communication", "leadership", "analytical", "creativity", "experience", "teamwork"];

export default function RecruiterJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", description: "", responsibilities: "", requirements: "",
    qualifications: "", min_education: "", min_experience_years: 0,
    salary_min: 0, salary_max: 0, benefits: "", location: "",
    city: "", state: "", work_type: "onsite" as "remote" | "hybrid" | "onsite", job_type: "full_time" as "full_time" | "part_time" | "internship" | "temporary",
    requirements_vector: {} as Record<string, number>,
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: company } = await supabase
      .from("companies").select("id").eq("user_id", user.id).single();
    if (!company) { setLoading(false); return; }
    setCompanyId(company.id);

    const { data } = await supabase
      .from("jobs").select("*").eq("company_id", company.id).order("posted_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      title: "", description: "", responsibilities: "", requirements: "",
      qualifications: "", min_education: "", min_experience_years: 0,
      salary_min: 0, salary_max: 0, benefits: "", location: "",
      city: "", state: "", work_type: "onsite", job_type: "full_time",
      requirements_vector: {},
    });
    setEditing(null);
  };

  const openEdit = (job: any) => {
    setEditing(job);
    setForm({
      title: job.title, description: job.description || "",
      responsibilities: job.responsibilities || "", requirements: job.requirements || "",
      qualifications: job.qualifications || "", min_education: job.min_education || "",
      min_experience_years: job.min_experience_years || 0,
      salary_min: job.salary_min || 0, salary_max: job.salary_max || 0,
      benefits: job.benefits || "", location: job.location || "",
      city: job.city || "", state: job.state || "",
      work_type: job.work_type, job_type: job.job_type,
      requirements_vector: (job.requirements_vector as Record<string, number>) || {},
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!companyId) return;
    const payload = {
      ...form,
      company_id: companyId,
      salary_min: form.salary_min || null,
      salary_max: form.salary_max || null,
      requirements_vector: form.requirements_vector,
    };

    if (editing) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Vaga atualizada!");
    } else {
      const { error } = await supabase.from("jobs").insert(payload);
      if (error) { toast.error("Erro ao criar vaga"); return; }
      toast.success("Vaga criada!");
    }
    setDialogOpen(false);
    resetForm();
    loadData();
  };

  const updateStatus = async (id: string, status: "active" | "paused" | "closed") => {
    await supabase.from("jobs").update({ status }).eq("id", id);
    toast.success("Status atualizado");
    loadData();
  };

  const updateVector = (dim: string, val: number) => {
    setForm({ ...form, requirements_vector: { ...form.requirements_vector, [dim]: val } });
  };

  if (loading) {
    return <AppLayout><div className="py-20 text-center text-muted-foreground">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Gerenciar Vagas</h1>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Nova Vaga</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Vaga" : "Nova Vaga"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de trabalho</Label>
                    <Select value={form.work_type} onValueChange={(v: "remote" | "hybrid" | "onsite") => setForm({ ...form, work_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remoto</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                        <SelectItem value="onsite">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de vaga</Label>
                    <Select value={form.job_type} onValueChange={(v: "full_time" | "part_time" | "internship" | "temporary") => setForm({ ...form, job_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">CLT</SelectItem>
                        <SelectItem value="part_time">Meio período</SelectItem>
                        <SelectItem value="internship">Estágio</SelectItem>
                        <SelectItem value="temporary">Temporário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salário mínimo</Label>
                    <Input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Salário máximo</Label>
                    <Input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Experiência mínima (anos)</Label>
                    <Input type="number" value={form.min_experience_years} onChange={(e) => setForm({ ...form, min_experience_years: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Requisitos</Label>
                  <Textarea rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Benefícios</Label>
                  <Input value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
                </div>

                {/* Requirements vector */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Vetor de Requisitos (0-1)</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {VECTOR_DIMENSIONS.map((dim) => (
                      <div key={dim} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-24 capitalize">{dim}</span>
                        <Input
                          type="number"
                          min={0} max={1} step={0.1}
                          value={form.requirements_vector[dim] || 0}
                          onChange={(e) => updateVector(dim, Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editing ? "Salvar Alterações" : "Publicar Vaga"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="shadow-card">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.city}, {job.state} · {job.work_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === "active" ? "default" : "secondary"}>
                    {job.status === "active" ? "Ativa" : job.status === "paused" ? "Pausada" : "Encerrada"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(job)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {job.status === "active" && (
                    <Button variant="ghost" size="icon" onClick={() => updateStatus(job.id, "paused")}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {job.status !== "closed" && (
                    <Button variant="ghost" size="icon" onClick={() => updateStatus(job.id, "closed")}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
