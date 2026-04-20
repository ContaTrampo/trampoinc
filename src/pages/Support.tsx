import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Send, MessageCircle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  {
    q: "Como funciona o sistema de match?",
    a: "Nosso algoritmo utiliza similaridade de cosseno para comparar o vetor do seu perfil profissional (gerado a partir do questionário de competências) com os requisitos de cada vaga. Quanto maior a porcentagem, mais compatível você é com a vaga.",
  },
  {
    q: "Quantas candidaturas posso fazer por dia?",
    a: "No plano Free, você pode se candidatar a até 5 vagas por dia. No plano Premium, esse limite sobe para 30 candidaturas diárias.",
  },
  {
    q: "Como faço para melhorar meu match?",
    a: "Complete seu perfil profissional com todas as informações, envie seu currículo atualizado e responda o questionário de competências com atenção. Quanto mais completo seu perfil, melhor será o match.",
  },
  {
    q: "Posso refazer o questionário?",
    a: "Sim! Você pode refazer o questionário quantas vezes quiser. As respostas anteriores serão substituídas pelas novas.",
  },
  {
    q: "Como funciona a convocação para entrevista?",
    a: "Quando o recrutador te convoca, você recebe uma notificação e pode ver o local da entrevista na aba Rotas, com mapa, estimativa de Uber e linhas de ônibus.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim! Utilizamos criptografia de ponta e políticas de segurança rigorosas. Seus dados pessoais e currículo são protegidos e só compartilhados com recrutadores quando você se candidata.",
  },
  {
    q: "Como cancelo meu plano Premium?",
    a: "Você pode cancelar seu plano Premium a qualquer momento nas configurações da sua conta. O acesso permanece até o fim do período pago.",
  },
  {
    q: "O cadastro por CPF é obrigatório?",
    a: "Sim, o CPF é utilizado para evitar contas duplicadas e garantir a segurança da plataforma. Cada CPF pode ter apenas uma conta.",
  },
];

export default function Support() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Mensagem enviada! Responderemos em até 24h.");
      setName("");
      setEmail("");
      setMessage("");
      setSending(false);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold text-foreground">Central de Suporte</h1>
          <p className="text-muted-foreground mt-2">Tire suas dúvidas ou entre em contato conosco</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* FAQ */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Fale Conosco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">suporte@talentmatch.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Chat disponível de seg-sex, 9h-18h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
