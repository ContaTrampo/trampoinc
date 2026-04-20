import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cosineSimilarity } from "@/lib/match";
import { toast } from "sonner";
import { MapPin, Building2, DollarSign, Briefcase, Search, Star, Check, Send } from "lucide-react";
import DispatchModal from "@/components/DispatchModal";

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  salary_min: number | null;
  salary_max: number | null;
  work_type: string;
  job_type: string;
  requirements_vector: Record<string, number> | null;
  company: { company_name: string } | null;
  matchScore?: number;
  applied?: boolean;
  saved?: boolean;
}

export default function Jobs() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterWorkType, setFilterWorkType] = useState("all");
  const [dispatchJob, setDispatchJob] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    if (!user) return;

    // Load jobs with company
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*, company:companies(company_name)")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("posted_at", { ascending: false });

    // Load candidate vector
    const { data: vectorData } = await supabase
      .from("candidate_profile_vectors")
      .select("vector")
      .eq("user_id", user.id)
      .single();

    // Load user applications
    const { data: appsData } = await supabase
      .from("applications")
      .select("job_id")
      .eq("user_id", user.id);

    // Load saved jobs
    const { data: savedData } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user.id);

    const appliedJobIds = new Set((appsData || []).map((a) => a.job_id));
    const savedJobIds = new Set((savedData || []).map((s) => s.job_id));
    const candidateVector = (vectorData?.vector as Record<string, number>) || null;

    const jobsWithMatch: Job[] = (jobsData || []).map((j: any) => {
      const reqVector = (j.requirements_vector as Record<string, number>) || null;
      let matchScore = 0;
      if (candidateVector && reqVector) {
        matchScore = Math.round(cosineSimilarity(candidateVector, reqVector));
      }
      return {
        ...j,
        company: j.company?.[0] || j.company,
        matchScore,
        applied: appliedJobIds.has(j.id),
        saved: savedJobIds.has(j.id),
      };
    });

    // Sort by match score
    jobsWithMatch.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    setJobs(jobsWithMatch);
    setLoading(false);
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    setApplying(jobId);

    // Check profile completed
    const { data: cp } = await supabase
      .from("candidate_profiles")
      .select("profile_completed")
      .eq("user_id", user.id)
      .single();

    if (!cp?.profile_completed) {
      toast.error("Complete seu perfil e questionário antes de se candidatar");
      setApplying(null);
      return;
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const { data: daily } = await supabase
      .from("daily_applications")
      .select("count")
      .eq("user_id", user.id)
      .eq("application_date", today)
      .single();

    const limit = profile?.plan === "premium" ? 30 : 5;
    const currentCount = daily?.count || 0;

    if (currentCount >= limit) {
      toast.error(
        profile?.plan === "free"
          ? "Limite diário atingido (5). Faça upgrade para Premium (30/dia)!"
          : "Limite diário atingido (30)."
      );
      setApplying(null);
      return;
    }

    const job = jobs.find((j) => j.id === jobId);
    const matchScore = job?.matchScore || 0;

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      job_id: jobId,
      match_score: matchScore,
    });

    if (error) {
      toast.error("Erro ao candidatar-se");
      setApplying(null);
      return;
    }

    // Update daily count
    if (daily) {
      await supabase
        .from("daily_applications")
        .update({ count: currentCount + 1 })
        .eq("user_id", user.id)
        .eq("application_date", today);
    } else {
      await supabase.from("daily_applications").insert({
        user_id: user.id,
        application_date: today,
        count: 1,
      });
    }

    // Create notification via authorized RPC
    await supabase.rpc("create_notification", {
      p_user_id: user.id,
      p_type: "application",
      p_title: "Candidatura enviada",
      p_message: `Você se candidatou para ${job?.title} com ${matchScore}% de match.`,
    });

    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));
    toast.success(`Candidatura enviada! Match: ${matchScore}%`);
    setApplying(null);
  };

  const toggleSave = async (jobId: string) => {
    if (!user) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (job.saved) {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
    } else {
      await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
    }
    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, saved: !j.saved } : j)));
  };

  const getMatchColor = (score: number) => {
    if (score >= 70) return "text-match-high bg-match-high/10 border-match-high/20";
    if (score >= 40) return "text-match-medium bg-match-medium/10 border-match-medium/20";
    return "text-match-low bg-match-low/10 border-match-low/20";
  };

  const workTypeLabels: Record<string, string> = {
    remote: "Remoto",
    hybrid: "Híbrido",
    onsite: "Presencial",
  };

  const cities = [...new Set(jobs.map((j) => j.city).filter(Boolean))].sort();

  const filteredJobs = jobs.filter((j) => {
    if (searchTerm && !j.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCity !== "all" && j.city !== filterCity) return false;
    if (filterWorkType !== "all" && j.work_type !== filterWorkType) return false;
    return true;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando vagas...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Vagas Disponíveis</h1>
          <p className="text-muted-foreground">Encontre as vagas ideais para o seu perfil</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterWorkType} onValueChange={setFilterWorkType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="remote">Remoto</SelectItem>
              <SelectItem value="hybrid">Híbrido</SelectItem>
              <SelectItem value="onsite">Presencial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs list */}
        <div className="grid gap-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma vaga encontrada.</div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-foreground">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {job.company?.company_name || "Empresa"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.city}, {job.state}
                            </span>
                            {job.salary_min && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                R$ {job.salary_min.toLocaleString()}{job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{workTypeLabels[job.work_type] || job.work_type}</Badge>
                        <Badge variant="outline">{job.job_type?.replace("_", " ")}</Badge>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-3 sm:items-end">
                      {/* Match badge */}
                      <div className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-bold ${getMatchColor(job.matchScore || 0)}`}>
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.matchScore || 0}%
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSave(job.id)}
                          className={job.saved ? "text-match-medium" : ""}
                        >
                          <Star className={`h-4 w-4 ${job.saved ? "fill-current" : ""}`} />
                        </Button>

                        {job.applied ? (
                          <Button variant="outline" disabled className="gap-1" size="sm">
                            <Check className="h-4 w-4" />
                            Candidatado
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleApply(job.id)}
                              disabled={applying === job.id}
                              size="sm"
                            >
                              {applying === job.id ? "Enviando..." : "Candidatar-se"}
                            </Button>
                            <Button
                              onClick={() => setDispatchJob({ id: job.id, title: job.title })}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Disparar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <DispatchModal
          open={!!dispatchJob}
          onClose={() => setDispatchJob(null)}
          jobId={dispatchJob?.id || ""}
          jobTitle={dispatchJob?.title || ""}
        />
      </div>
    </AppLayout>
  );
}
