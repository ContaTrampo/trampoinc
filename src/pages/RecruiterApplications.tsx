import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCheck, Mail } from "lucide-react";

export default function RecruiterApplications() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadJobs();
  }, [user]);

  useEffect(() => {
    if (selectedJob) loadApplications(selectedJob);
  }, [selectedJob]);

  const loadJobs = async () => {
    if (!user) return;
    const { data: company } = await supabase
      .from("companies").select("id").eq("user_id", user.id).single();
    if (!company) { setLoading(false); return; }

    const { data } = await supabase
      .from("jobs").select("id, title").eq("company_id", company.id).order("posted_at", { ascending: false });
    setJobs(data || []);
    if (data && data.length > 0) setSelectedJob(data[0].id);
    setLoading(false);
  };

  const loadApplications = async (jobId: string) => {
    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .eq("job_id", jobId)
      .order("match_score", { ascending: false });

    const list = apps || [];
    const userIds = Array.from(new Set(list.map((a: any) => a.user_id)));

    // Fetch public profile data (name only, no PII like email/CPF) via safe view
    const { data: profilesData } = userIds.length
      ? await supabase.from("profiles_public").select("user_id, name").in("user_id", userIds)
      : { data: [] as any[] };

    // Recruiters can read candidate_profiles via existing RLS policy
    const { data: candidatesData } = userIds.length
      ? await supabase.from("candidate_profiles").select("user_id, skills, education_level").in("user_id", userIds)
      : { data: [] as any[] };

    const profileMap = new Map((profilesData || []).map((p: any) => [p.user_id, p]));
    const candidateMap = new Map((candidatesData || []).map((c: any) => [c.user_id, c]));

    setApplications(
      list.map((a: any) => ({
        ...a,
        profile: profileMap.get(a.user_id) || null,
        candidateProfile: candidateMap.get(a.user_id) || null,
      }))
    );
  };

  const callForInterview = async (app: any) => {
    await supabase.from("applications").update({ status: "interview" }).eq("id", app.id);

    await supabase.rpc("create_notification", {
      p_user_id: app.user_id,
      p_type: "interview",
      p_title: "Convocação para Entrevista",
      p_message: `Você foi convocado para entrevista na vaga selecionada. Parabéns!`,
    });

    toast.success("Candidato convocado para entrevista!");
    loadApplications(selectedJob);
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    reviewed: "Analisado",
    interview: "Entrevista",
    hired: "Contratado",
    rejected: "Rejeitado",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    reviewed: "bg-primary/10 text-primary",
    interview: "bg-match-medium/10 text-match-medium",
    hired: "bg-accent/10 text-accent",
    rejected: "bg-destructive/10 text-destructive",
  };

  if (loading) {
    return <AppLayout><div className="py-20 text-center text-muted-foreground">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Candidatos por Vaga</h1>

        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Selecione uma vaga" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {applications.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma candidatura para esta vaga.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {applications.map((app) => (
              <Card key={app.id} className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{app.profile?.name || "Candidato"}</h3>
                      <p className="text-xs text-muted-foreground">Aplicou em {new Date(app.applied_at).toLocaleDateString("pt-BR")}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {app.candidateProfile?.education_level && (
                          <Badge variant="outline" className="text-xs">{app.candidateProfile.education_level}</Badge>
                        )}
                        {app.candidateProfile?.skills?.split(",").slice(0, 3).map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s.trim()}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Match</p>
                        <div className="w-20">
                          <Progress value={Number(app.match_score) || 0} className="h-2" />
                          <p className="text-xs font-bold text-primary mt-0.5">{Math.round(Number(app.match_score) || 0)}%</p>
                        </div>
                      </div>

                      <Badge className={statusColors[app.status] || ""}>
                        {statusLabels[app.status] || app.status}
                      </Badge>

                      {app.status === "pending" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => callForInterview(app)}>
                          <UserCheck className="h-3.5 w-3.5" />
                          Entrevista
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
