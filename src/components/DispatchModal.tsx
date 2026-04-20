import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Copy, Mail, Send, Sparkles } from "lucide-react";

interface DispatchModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  contactEmail: string | null;
  companyName: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string | null;
}

export default function DispatchModal({ open, onClose, jobId, jobTitle }: DispatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [editedBody, setEditedBody] = useState("");

  const generateEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-application-email", {
        body: { jobId },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      setEmail(data);
      setEditedBody(data.body);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar e-mail");
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    const fullEmail = `Assunto: ${email?.subject}\n\n${editedBody}`;
    await navigator.clipboard.writeText(fullEmail);
    toast.success("E-mail copiado!");
  };

  const openMailto = () => {
    if (!email) return;
    const to = email.contactEmail || "";
    const subject = encodeURIComponent(email.subject);
    const body = encodeURIComponent(editedBody);
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleClose = () => {
    setEmail(null);
    setEditedBody("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Disparar Candidatura — {jobTitle}
          </DialogTitle>
        </DialogHeader>

        {!email && !loading && (
          <div className="text-center py-8 space-y-4">
            <Sparkles className="h-12 w-12 text-primary mx-auto" />
            <p className="text-muted-foreground">
              A IA vai gerar um e-mail personalizado com base no seu perfil e nos requisitos da vaga.
            </p>
            <Button onClick={generateEmail} className="gradient-primary gap-2">
              <Sparkles className="h-4 w-4" />
              Gerar E-mail com IA
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Gerando e-mail personalizado...</p>
          </div>
        )}

        {email && !loading && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">Para:</span>
                <span className="text-muted-foreground">
                  {email.contactEmail || "Copie e cole no e-mail da empresa"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">Assunto:</span>
                <span className="text-muted-foreground">{email.subject}</span>
              </div>
              {email.resumeUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Currículo:</span>
                  <a
                    href={email.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline text-xs"
                  >
                    Anexado (link)
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Corpo do e-mail (edite se quiser)
              </label>
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="min-h-[250px] text-sm leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar E-mail
              </Button>
              <Button onClick={openMailto} className="gradient-primary gap-2">
                <Mail className="h-4 w-4" />
                Abrir no E-mail
              </Button>
              <Button onClick={generateEmail} variant="ghost" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Regenerar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
