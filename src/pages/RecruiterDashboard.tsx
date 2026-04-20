import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Clock } from "lucide-react";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeJobs: 0, totalApps: 0, interviews: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!company) return;

    const { count: activeJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company.id)
      .eq("status", "active");

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, status, posted_at")
      .eq("company_id", company.id)
      .order("posted_at", { ascending: false })
      .limit(5);

    const jobIds = (jobs || []).map((j) => j.id);
    let totalApps = 0;
    let interviews = 0;

    if (jobIds.length > 0) {
      const { count: appsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds);
      totalApps = appsCount || 0;

      const { count: intCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds)
        .eq("status", "interview");
      interviews = intCount || 0;
    }

    setStats({ activeJobs: activeJobs || 0, totalApps, interviews });
    setRecentJobs(jobs || []);
  };

  const statCards = [
    { label: "Vagas Ativas", value: stats.activeJobs, icon: Briefcase, color: "text-primary" },
    { label: "Total Candidaturas", value: stats.totalApps, icon: Users, color: "text-accent" },
    { label: "Entrevistas", value: stats.interviews, icon: TrendingUp, color: "text-match-medium" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Dashboard do Recrutador</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Vagas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma vaga publicada ainda.</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-foreground">{j.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Publicada em {new Date(j.posted_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      j.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {j.status === "active" ? "Ativa" : j.status === "paused" ? "Pausada" : "Encerrada"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
