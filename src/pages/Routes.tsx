import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Car, Bus, Clock, Printer, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function Routes() {
  const { user } = useAuth();
  const [interview, setInterview] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (user) loadInterview();
  }, [user]);

  useEffect(() => {
    if (interview && job?.latitude && job?.longitude) {
      loadMap();
    }
  }, [interview, job]);

  const loadInterview = async () => {
    if (!user) return;
    const { data: app } = await supabase
      .from("applications")
      .select("*, job:jobs(*, company:companies(company_name, city, state))")
      .eq("user_id", user.id)
      .eq("status", "interview")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (app) {
      setInterview(app);
      const j = Array.isArray(app.job) ? app.job[0] : app.job;
      setJob(j);
    }
    setLoading(false);
  };

  const loadMap = async () => {
    if (!job?.latitude || !job?.longitude) return;
    const L = await import("leaflet");

    // Fix leaflet default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const container = document.getElementById("map");
    if (!container) return;
    container.innerHTML = "";

    const map = L.map("map").setView([job.latitude, job.longitude], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const company = Array.isArray(job.company) ? job.company[0] : job.company;
    L.marker([job.latitude, job.longitude])
      .addTo(map)
      .bindPopup(`<b>${company?.company_name || "Local da Entrevista"}</b><br/>${job.city}, ${job.state}`)
      .openPopup();

    setMapReady(true);
  };

  const estimateUber = (km: number) => {
    return {
      uberX: Math.max(8, Math.round(7 + km * 2.1 + Math.random() * 3)),
      uberComfort: Math.max(12, Math.round(10 + km * 2.8 + Math.random() * 5)),
      uberBlack: Math.max(18, Math.round(15 + km * 3.5 + Math.random() * 7)),
    };
  };

  const busRoutes = [
    { line: "101", name: "Terminal Central - Zona Norte", time: "35 min", fare: "R$ 4,40" },
    { line: "205", name: "Estação Sul - Centro Comercial", time: "42 min", fare: "R$ 4,40" },
    { line: "310", name: "Rodoviária - Distrito Industrial", time: "28 min", fare: "R$ 4,40" },
  ];

  const distance = 8 + Math.random() * 15;
  const uberPrices = estimateUber(distance);

  if (loading) {
    return <AppLayout><div className="py-20 text-center text-muted-foreground">Carregando...</div></AppLayout>;
  }

  if (!interview) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl text-center py-20 space-y-4">
          <Navigation className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="font-display text-2xl font-bold text-foreground">Nenhuma entrevista agendada</h1>
          <p className="text-muted-foreground">
            Quando você for convocado para uma entrevista, as informações de rota aparecerão aqui.
            Continue se candidatando às vagas com melhor match!
          </p>
          <Button onClick={() => window.location.href = "/jobs"}>Ver Vagas</Button>
        </div>
      </AppLayout>
    );
  }

  const company = job ? (Array.isArray(job.company) ? job.company[0] : job.company) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Rota para Entrevista</h1>
          <p className="text-muted-foreground">
            {job?.title} - {company?.company_name}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="shadow-card overflow-hidden">
              <div id="map" className="h-[400px] w-full bg-muted">
                {!job?.latitude && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center space-y-2">
                      <MapPin className="h-12 w-12 mx-auto" />
                      <p>Localização não disponível para esta vaga</p>
                      <p className="text-sm">{job?.location || `${job?.city}, ${job?.state}`}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            {/* Location */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">{company?.company_name}</p>
                <p className="text-sm text-muted-foreground">{job?.location || `${job?.city}, ${job?.state}`}</p>
                <p className="text-sm text-muted-foreground mt-1">Distância estimada: ~{distance.toFixed(1)} km</p>
              </CardContent>
            </Card>

            {/* Uber estimates */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4 text-primary" />
                  Estimativa Uber
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "UberX", price: uberPrices.uberX, time: `${Math.round(distance * 2.5)} min` },
                  { name: "Comfort", price: uberPrices.uberComfort, time: `${Math.round(distance * 2.3)} min` },
                  { name: "Black", price: uberPrices.uberBlack, time: `${Math.round(distance * 2)} min` },
                ].map((u) => (
                  <div key={u.name} className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div>
                      <p className="font-medium text-sm text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {u.time}
                      </p>
                    </div>
                    <span className="font-bold text-primary">R$ {u.price}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Bus routes */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bus className="h-4 w-4 text-primary" />
                  Linhas de Ônibus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {busRoutes.map((b) => (
                  <div key={b.line} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-sm">{b.line}</span>
                      <span className="text-xs text-muted-foreground">{b.fare}</span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5">{b.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {b.time}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir Rota
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
