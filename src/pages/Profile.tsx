import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, FileText, User } from "lucide-react";
import { toast } from "sonner";

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [hasAnswers, setHasAnswers] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data || {});

    const { count } = await supabase
      .from("candidate_answers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setHasAnswers((count || 0) > 0);
    setLoading(false);
  };

  const progressPercent = (() => {
    if (!profile) return 0;
    let p = 0;
    if (profile.full_name && profile.city && profile.state) p += 20;
    if (profile.resume_file_url) p += 40;
    if (hasAnswers) p += 40;
    return p;
  })();

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("candidate_profiles")
      .update({
        full_name: profile.full_name,
        birth_date: profile.birth_date,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        education_level: profile.education_level,
        institution: profile.institution,
        course: profile.course,
        graduation_year: profile.graduation_year,
        professional_summary: profile.professional_summary,
        skills: profile.skills,
        languages: profile.languages,
        desired_position: profile.desired_position,
        salary_expectation: profile.salary_expectation,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Perfil salvo com sucesso!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro no upload");
      setUploading(false);
      return;
    }

    // Store the storage path; generate signed URLs on demand when needed.
    await supabase
      .from("candidate_profiles")
      .update({ resume_file_url: filePath })
      .eq("user_id", user.id);

    setProfile({ ...profile, resume_file_url: filePath });
    toast.success("Currículo enviado!");
    setUploading(false);
  };

  const update = (field: string, value: any) => setProfile({ ...profile, [field]: value });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Perfil Profissional</h1>
          <p className="text-muted-foreground">Complete seu perfil para melhorar seus matches</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso do Perfil</span>
              <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {profile?.full_name ? <CheckCircle className="h-3 w-3 text-accent" /> : <User className="h-3 w-3" />}
                Info pessoais
              </span>
              <span className="flex items-center gap-1">
                {profile?.resume_file_url ? <CheckCircle className="h-3 w-3 text-accent" /> : <FileText className="h-3 w-3" />}
                Currículo
              </span>
              <span className="flex items-center gap-1">
                {hasAnswers ? <CheckCircle className="h-3 w-3 text-accent" /> : <FileText className="h-3 w-3" />}
                Questionário
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Resume upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Currículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.resume_file_url ? (
              <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-4">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="text-sm text-foreground">Currículo enviado</span>
                <label className="ml-auto">
                  <Button variant="outline" size="sm" asChild>
                    <span>Substituir</span>
                  </Button>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Enviando..." : "Clique para enviar seu currículo (PDF, DOC até 5MB)"}
                </span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={profile?.full_name || ""} onChange={(e) => update("full_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input type="date" value={profile?.birth_date || ""} onChange={(e) => update("birth_date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={profile?.phone || ""} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={profile?.address || ""} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={profile?.city || ""} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={profile?.state || ""} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader><CardTitle>Formação e Experiência</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nível de escolaridade</Label>
                <Select value={profile?.education_level || ""} onValueChange={(v) => update("education_level", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamental">Fundamental</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="superior">Superior</SelectItem>
                    <SelectItem value="pos">Pós-graduação</SelectItem>
                    <SelectItem value="mestrado">Mestrado</SelectItem>
                    <SelectItem value="doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instituição</Label>
                <Input value={profile?.institution || ""} onChange={(e) => update("institution", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Curso</Label>
                <Input value={profile?.course || ""} onChange={(e) => update("course", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ano de formação</Label>
                <Input type="number" value={profile?.graduation_year || ""} onChange={(e) => update("graduation_year", parseInt(e.target.value) || null)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resumo profissional</Label>
              <Textarea rows={4} value={profile?.professional_summary || ""} onChange={(e) => update("professional_summary", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Habilidades (separadas por vírgula)</Label>
                <Input value={profile?.skills || ""} onChange={(e) => update("skills", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Idiomas</Label>
                <Input value={profile?.languages || ""} onChange={(e) => update("languages", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cargo desejado</Label>
                <Input value={profile?.desired_position || ""} onChange={(e) => update("desired_position", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pretensão salarial (R$)</Label>
                <Input type="number" value={profile?.salary_expectation || ""} onChange={(e) => update("salary_expectation", parseFloat(e.target.value) || null)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Salvando..." : "Salvar Perfil"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/questionnaire")}>
            {hasAnswers ? "Refazer Questionário" : "Iniciar Questionário"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
