import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [userType, setUserType] = useState<string>("candidate");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["", "Fraca", "Fraca", "Média", "Forte", "Muito Forte"][strength] || "";
  const strengthColor = ["", "bg-destructive", "bg-destructive", "bg-match-medium", "bg-primary", "bg-primary"][strength] || "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      toast.error("Email ou senha incorretos");
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          user_type: userType,
          cpf: cpf.replace(/\D/g, ""),
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ cpf: cpf.replace(/\D/g, "") })
        .eq("user_id", data.user.id);

      if (userType === "recruiter" && companyName) {
        await supabase.rpc("create_company_for_recruiter", {
          p_user_id: data.user.id,
          p_company_name: companyName,
          p_cnpj: cnpj.replace(/\D/g, ""),
        });
      }
    }

    setLoading(false);
    toast.success("Conta criada com sucesso! Verifique seu e-mail.");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 watermark-trampo">
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Trampo</h1>
          <p className="mt-2 text-muted-foreground">Conectando talentos às melhores oportunidades</p>
        </div>

        <Card className="shadow-elevated">
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
  <form onSubmit={handleLogin} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="login-email">Email</Label>
      <Input
        id="login-email"
        type="email"
        placeholder="seu@email.com"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="login-password">Senha</Label>

      <div className="relative">
        <Input
          id="login-password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 🔥 BOTÃO ESQUECI SENHA */}
      <div className="text-right">
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Esqueci minha senha
        </a>
      </div>
    </div>

    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Entrando..." : "Entrar"}
    </Button>
  </form>
</TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de conta</Label>
                    <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">Candidato</SelectItem>
                        <SelectItem value="recruiter">Recrutador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userType === "recruiter" && (
                    <>
                      <div className="space-y-2">
                        <Label>Nome da Empresa</Label>
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>CNPJ</Label>
                        <Input
                          value={cnpj}
                          onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                          placeholder="00.000.000/0000-00"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    {password && (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : "bg-border"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Senha</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando conta..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
