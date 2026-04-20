import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { normalizeVector, sumVectors } from "@/lib/match";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  category: string;
  options: { id: string; option_text: string; weight_vector: Record<string, number> }[];
}

export default function Questionnaire() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const QUESTIONS_PER_PAGE = 5;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    // Get 20 random active questions
    const { data: qData } = await supabase
      .from("questions")
      .select("id, question_text, category")
      .eq("active", true)
      .limit(100);

    if (!qData || qData.length === 0) {
      setLoading(false);
      return;
    }

    // Shuffle and take 20
    const shuffled = qData.sort(() => Math.random() - 0.5).slice(0, 20);
    const qIds = shuffled.map((q) => q.id);

    const { data: optData } = await supabase
      .from("question_options")
      .select("id, question_id, option_text, weight_vector")
      .in("question_id", qIds);

    const questionsWithOptions: Question[] = shuffled.map((q) => ({
      ...q,
      options: (optData || [])
        .filter((o) => o.question_id === q.id)
        .map((o) => ({
          id: o.id,
          option_text: o.option_text,
          weight_vector: (o.weight_vector as Record<string, number>) || {},
        })),
    }));

    setQuestions(questionsWithOptions);
    setLoading(false);
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const handleSubmit = async () => {
    if (!user) return;
    if (answeredCount < questions.length) {
      toast.error("Responda todas as perguntas antes de enviar");
      return;
    }

    setSubmitting(true);

    // Delete old answers
    await supabase.from("candidate_answers").delete().eq("user_id", user.id);

    // Insert new answers
    const rows = Object.entries(answers).map(([questionId, optionId]) => ({
      user_id: user.id,
      question_id: questionId,
      option_id: optionId,
    }));
    await supabase.from("candidate_answers").insert(rows);

    // Calculate profile vector
    const weightVectors = Object.entries(answers).map(([qId, optId]) => {
      const q = questions.find((q) => q.id === qId);
      const opt = q?.options.find((o) => o.id === optId);
      return opt?.weight_vector || {};
    });

    const summed = sumVectors(weightVectors);
    const normalized = normalizeVector(summed);

    // Upsert profile vector
    await supabase.from("candidate_profile_vectors").upsert({
      user_id: user.id,
      vector: normalized,
      updated_at: new Date().toISOString(),
    });

    // Mark profile as completed
    await supabase
      .from("candidate_profiles")
      .update({ profile_completed: true })
      .eq("user_id", user.id);

    setSubmitting(false);
    toast.success("Questionário concluído! Seu perfil de match foi gerado.");
    navigate("/jobs");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando questionário...</div>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nenhuma pergunta disponível no momento.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Questionário de Perfil</h1>
          <p className="text-muted-foreground">
            Responda as perguntas para gerar seu perfil de match
          </p>
        </div>

        {/* Progress */}
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-sm rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{answeredCount} de {questions.length} respondidas</span>
            <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {pageQuestions.map((q, idx) => (
            <Card
              key={q.id}
              className={`transition-all ${answers[q.id] ? "border-accent/30 bg-accent/5" : ""}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {currentPage * QUESTIONS_PER_PAGE + idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{q.question_text}</p>
                    <span className="text-xs text-muted-foreground capitalize">{q.category.replace("_", " ")}</span>
                  </div>
                  {answers[q.id] && <CheckCircle className="ml-auto h-5 w-5 text-accent shrink-0" />}
                </div>
                <RadioGroup
                  value={answers[q.id] || ""}
                  onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                  className="space-y-2 pl-10"
                >
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                        answers[q.id] === opt.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      <Label htmlFor={opt.id} className="cursor-pointer flex-1 text-sm">
                        {opt.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentPage > 0 && (
            <Button variant="outline" onClick={() => setCurrentPage(currentPage - 1)}>
              Anterior
            </Button>
          )}
          <div className="flex-1" />
          {currentPage < totalPages - 1 ? (
            <Button onClick={() => setCurrentPage(currentPage + 1)}>
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < questions.length}
              className="gradient-primary"
            >
              {submitting ? "Enviando..." : "Concluir Questionário"}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
