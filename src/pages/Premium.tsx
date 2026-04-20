import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, TrendingUp, Bell, Shield, Briefcase } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "Grátis",
    description: "Para quem está começando",
    features: [
      { text: "5 candidaturas por dia", included: true },
      { text: "Perfil profissional básico", included: true },
      { text: "Questionário de competências", included: true },
      { text: "Match com vagas", included: true },
      { text: "Destaque visual nas vagas", included: false },
      { text: "Relatórios de compatibilidade", included: false },
      { text: "Notificações em tempo real", included: false },
      { text: "Prioridade no parsing de CV", included: false },
      { text: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Premium",
    price: "R$ 29,90",
    period: "/mês",
    description: "Para quem quer se destacar",
    popular: true,
    features: [
      { text: "30 candidaturas por dia", included: true },
      { text: "Perfil profissional completo", included: true },
      { text: "Questionário de competências", included: true },
      { text: "Match com vagas", included: true },
      { text: "Destaque visual nas vagas", included: true },
      { text: "Relatórios de compatibilidade", included: true },
      { text: "Notificações em tempo real", included: true },
      { text: "Prioridade no parsing de CV", included: true },
      { text: "Suporte prioritário", included: true },
    ],
  },
];

export default function Premium() {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
            <Crown className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Escolha seu Plano</h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Desbloqueie todo o potencial da plataforma e tenha acesso às melhores oportunidades
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative shadow-card ${plan.popular ? "border-accent border-2 shadow-elevated" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground gap-1 px-3">
                    <Star className="h-3 w-3" /> Mais popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <Check className={`h-4 w-4 shrink-0 ${f.included ? "text-accent" : "text-border"}`} />
                      <span className={`text-sm ${f.included ? "text-foreground" : "text-muted-foreground line-through"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${plan.popular ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    if (profile?.plan === "premium" && plan.name === "Premium") {
                      toast.info("Você já é Premium!");
                    } else if (plan.name === "Premium") {
                      toast.info("Funcionalidade de pagamento em breve!");
                    }
                  }}
                  disabled={profile?.plan === plan.name.toLowerCase()}
                >
                  {profile?.plan === plan.name.toLowerCase() ? "Plano Atual" : plan.popular ? "Assinar Premium" : "Plano Atual"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Zap, title: "6x mais candidaturas", desc: "30 por dia vs 5 do Free" },
            { icon: TrendingUp, title: "Destaque visual", desc: "Seu perfil aparece primeiro" },
            { icon: Bell, title: "Alertas em tempo real", desc: "Seja notificado de novas vagas" },
            { icon: Shield, title: "Suporte VIP", desc: "Atendimento prioritário" },
          ].map((b) => (
            <Card key={b.title} className="text-center shadow-card">
              <CardContent className="pt-6">
                <b.icon className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-display font-semibold text-foreground text-sm">{b.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
