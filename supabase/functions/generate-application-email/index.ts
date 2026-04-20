import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { jobId } = await req.json();
    if (!jobId) {
      return new Response(JSON.stringify({ error: "jobId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch candidate profile
    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", userId)
      .single();

    // Fetch job with company
    const { data: job } = await supabase
      .from("jobs")
      .select("*, company:companies(company_name, website)")
      .eq("id", jobId)
      .single();

    if (!job || !candidateProfile || !userProfile) {
      return new Response(JSON.stringify({ error: "Dados não encontrados" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const company = Array.isArray(job.company) ? job.company[0] : job.company;

    const prompt = `Você é um assistente de carreira brasileiro especializado em redigir e-mails de candidatura profissionais.

Gere um e-mail de candidatura profissional em português brasileiro com base nos dados abaixo.

CANDIDATO:
- Nome: ${userProfile.name}
- Email: ${userProfile.email}
- Resumo profissional: ${candidateProfile.professional_summary || "Não informado"}
- Habilidades: ${candidateProfile.skills || "Não informado"}
- Formação: ${candidateProfile.education_level || "Não informado"} em ${candidateProfile.course || "Não informado"} - ${candidateProfile.institution || "Não informado"}
- Posição desejada: ${candidateProfile.desired_position || "Não informado"}

VAGA:
- Cargo: ${job.title}
- Empresa: ${company?.company_name || "Empresa"}
- Descrição: ${job.description || "Não informado"}
- Requisitos: ${job.requirements || "Não informado"}
- Localização: ${job.city}, ${job.state}

INSTRUÇÕES:
1. Assunto do e-mail na primeira linha no formato "Assunto: ..."
2. Corpo do e-mail formal mas amigável
3. Destaque as habilidades do candidato que se alinham com a vaga
4. Mencione disponibilidade e interesse
5. Termine com saudação cordial
6. Mantenha entre 150-250 palavras
7. Não invente informações que não foram fornecidas`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "Você é um redator profissional de e-mails de candidatura. Responda APENAS com o e-mail, sem explicações adicionais.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar e-mail" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedEmail =
      aiData.choices?.[0]?.message?.content || "Erro ao gerar e-mail";

    // Parse subject from generated email
    let subject = `Candidatura - ${job.title}`;
    let body = generatedEmail;
    const subjectMatch = generatedEmail.match(/^Assunto:\s*(.+)/m);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = generatedEmail.replace(/^Assunto:\s*.+\n*/m, "").trim();
    }

    return new Response(
      JSON.stringify({
        subject,
        body,
        contactEmail: job.contact_email || null,
        companyName: company?.company_name || "Empresa",
        candidateName: userProfile.name,
        candidateEmail: userProfile.email,
        resumeUrl: candidateProfile.resume_file_url || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("generate-application-email error:", e);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor. Tente novamente em instantes." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
