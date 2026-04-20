import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, User, LogOut, LayoutDashboard, FileText, Menu, X, MapPin, Crown, HelpCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function YouTubeSidebar() {
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("youtube_links")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .limit(6)
      .then(({ data }) => setLinks(data || []));
  }, []);

  if (links.length === 0) return null;

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|v=)([^&?]+)/);
    return match ? match[1] : null;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          📺 Dicas para sua Carreira
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => {
          const videoId = getYouTubeId(link.url);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              {videoId && (
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt={link.title}
                  className="w-full rounded-lg mb-1 group-hover:opacity-80 transition-opacity"
                />
              )}
              <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {link.title}
              </p>
              {link.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
              )}
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function AppLayout({ children, hideSidebar }: { children: React.ReactNode; hideSidebar?: boolean }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  const candidateLinks = [
    { to: "/jobs", label: "Vagas", icon: Briefcase },
    { to: "/profile", label: "Perfil", icon: User },
    { to: "/questionnaire", label: "Questionário", icon: FileText },
    { to: "/routes", label: "Rotas", icon: MapPin },
    { to: "/premium", label: "Premium", icon: Crown },
    { to: "/support", label: "Suporte", icon: HelpCircle },
  ];

  const recruiterLinks = [
    { to: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/recruiter/jobs", label: "Vagas", icon: Briefcase },
    { to: "/recruiter/applications", label: "Candidatos", icon: User },
    { to: "/support", label: "Suporte", icon: HelpCircle },
  ];

  const links = profile?.user_type === "recruiter" ? recruiterLinks : candidateLinks;

  return (
    <div className="min-h-screen bg-background watermark-trampo">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Trampo</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
              <span className="text-sm font-medium text-secondary-foreground">
                {profile?.name}
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                {profile?.plan}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-card p-4 space-y-2 animate-fade-in">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        )}
      </header>

      <div className="container py-6 animate-fade-in relative z-10">
        {hideSidebar ? (
          <main>{children}</main>
        ) : (
          <div className="flex gap-6">
            <main className="flex-1 min-w-0">{children}</main>
            <aside className="hidden xl:block w-72 shrink-0 space-y-4">
              <YouTubeSidebar />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
