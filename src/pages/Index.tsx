import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Zap, ArrowRight, CheckCircle, Star, Quote, Send, MapPin } from "lucide-react";

export default function Index() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.user_type === "recruiter") navigate("/recruiter/dashboard");
      else if (profile.user_type === "admin") navigate("/admin");
      else navigate("/jobs");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setTestimonials(data || []));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background watermark-trampo">
      {/* Hero */}
      <div className="gradient-hero text-primary-foreground">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
              <Briefcase className="h-8 w-8" />
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Seu próximo{" "}
              <span className="text-accent">trampo</span> começa{" "}
              <span className="text-accent">aqui</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              Plataforma inteligente que conecta talentos às melhores oportunidades de Salvador e região. 
              IA que analisa seu currículo, encontra vagas e te leva até a entrevista.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Sou recrutador
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container py-20">
        <h2 className="font-display text-3xl font-bold text-center mb-12">Como funciona</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { icon: Users, title: "Crie seu perfil", description: "Envie seu currículo e a IA preenche tudo automaticamente." },
            { icon: Zap, title: "Match inteligente", description: "Algoritmo cruza seu perfil com cada vaga disponível." },
            { icon: Send, title: "Dispare candidaturas", description: "Candidate-se com um clique. E-mail personalizado é enviado." },
            { icon: MapPin, title: "Rota até a entrevista", description: "Veja o mapa, preço do Uber e qual ônibus pegar." },
          ].map((f) => (
            <div key={f.title} className="text-center p-6 rounded-xl bg-card shadow-card animate-fade-in">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="bg-muted/50">
          <div className="container py-16">
            <h2 className="font-display text-3xl font-bold text-center mb-4">Depoimentos</h2>
            <p className="text-center text-muted-foreground mb-10">Veja o que nossos usuários dizem sobre o Trampo</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id} className="shadow-card">
                  <CardContent className="pt-6">
                    <Quote className="h-6 w-6 text-primary/30 mb-3" />
                    <p className="text-sm text-foreground mb-4 italic">"{t.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {t.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="bg-card border-y">
        <div className="container py-16">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">Por que Trampo?</h2>
              <div className="space-y-4">
                {[
                  "IA analisa seu currículo e preenche o perfil automaticamente",
                  "Match inteligente entre candidato e vaga",
                  "Disparo automático com e-mail personalizado",
                  "Rota com mapa, Uber e ônibus até a entrevista",
                  "WhatsApp direto com o recrutador",
                  "Vídeos educativos sobre carreira",
                  "Plano Premium com candidaturas ilimitadas",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl gradient-primary p-8 text-primary-foreground">
              <h3 className="font-display text-2xl font-bold mb-2">Plano Premium</h3>
              <p className="text-primary-foreground/70 mb-4">Desbloqueie todo o potencial da plataforma</p>
              <ul className="space-y-2 text-sm">
                <li>✓ 30 candidaturas por dia</li>
                <li>✓ Análise de currículo com IA avançada</li>
                <li>✓ Disparo automático de e-mails</li>
                <li>✓ Destaque visual nas vagas</li>
                <li>✓ Notificações em tempo real</li>
              </ul>
              <Button
                className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onClick={() => navigate("/auth")}
              >
                Começar agora
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container py-8 text-center text-sm text-muted-foreground">
        © 2026 Trampo. Conectando talentos às melhores oportunidades de Salvador.
      </footer>
    </div>
  );
}
