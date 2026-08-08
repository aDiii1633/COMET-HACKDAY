"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Activity, Navigation2, Zap, ArrowRight, ShieldCheck, User, AlertTriangle, Building2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocationStore } from "@/store/useLocationStore";
import { guardiansApi, reportsApi, crimeApi, placesApi } from "@/lib/api/services";
import { useCompanionState } from "@/store/useCompanionState";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { setExpression, triggerGesture, showSpeech } = useCompanionState();
  const { lat, lng, address: locationName, riskData, isRiskLoading, hasInitialized, initializeLocation } = useLocationStore();
  const [forecast, setForecast] = useState<{forecasts: Array<{forecast_risk_score: number, risk_level: string}>} | null>(null);
  const [guardians, setGuardians] = useState<Array<{name: string, relation: string}>>([]);
  const [reports, setReports] = useState<Array<{severity: number, category?: string, type?: string, description: string, status?: string}>>([]);
  const [crimeStats, setCrimeStats] = useState<{total_nearby_crimes: number, avg_severity: number, top_crime_type?: string, is_historical_data_available: boolean} | null>(null);
  const [places, setPlaces] = useState<{nearby_safe_havens: Array<{type: string, name: string}>} | null>(null);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  useEffect(() => {
    async function loadDashboardExtras() {
      if (!hasInitialized || lat === null || lng === null) return;
      try {
        setLoadingExtras(true);
        const [fc, grd, rep, crime, place] = await Promise.all([
          // Only fetch non-risk dependencies
          fetch(`/api/v1/risk/forecast?latitude=${lat}&longitude=${lng}`).then(r => r.ok ? r.json() : null).catch(() => null),
          guardiansApi.list(),
          reportsApi.list(5),
          crimeApi.stats(lat, lng),
          placesApi.emergencyNearby(lat, lng)
        ]);
        if (fc) setForecast(fc);
        setGuardians(grd);
        setReports(rep);
        setCrimeStats(crime);
        setPlaces(place);
      } catch (e) {
        console.error("Dashboard extras load error:", e);
        setError("Some live data could not be loaded.");
      } finally {
        setLoadingExtras(false);
      }
    }

    // Companion reacts to loading state
    setExpression("thinking");
    loadDashboardExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized, lat, lng]);



  // Companion reacts to risk level changes
  useEffect(() => {
    if (isRiskLoading || !hasInitialized) return;
    if (!riskData) {
      setExpression("concerned");
      return;
    }
    const level = riskData.risk_level;
    if (level === "SAFE") {
      setExpression("happy");
      showSpeech("Your area looks safe!", 3000);
    } else if (level === "WARNING") {
      setExpression("concerned");
      showSpeech("Stay alert in this area.", 3000);
    } else if (level === "DANGER") {
      setExpression("serious");
      showSpeech("Be very careful here.", 4000);
    } else {
      setExpression("idle");
    }
  }, [isRiskLoading, hasInitialized, riskData, setExpression, showSpeech]);

  const currentRisk = riskData?.risk_score ?? 24;
  const riskLevel = riskData?.risk_level ?? "SAFE";
  const riskColorClass = riskLevel === "SAFE" ? "text-[#14532D]" : riskLevel === "WARNING" ? "text-[#78350F]" : "text-[#7F1D1D]";
  const riskBorderClass = riskLevel === "SAFE" ? "border-t-[#15803D]" : riskLevel === "WARNING" ? "border-t-[#B45309]" : "border-t-[#B91C1C]";
  const riskBadgeBg = riskLevel === "SAFE" ? "bg-[#DCFCE7] text-[#14532D]" : riskLevel === "WARNING" ? "bg-[#FEF3C7] text-[#78350F]" : "bg-[#FEE2E2] text-[#7F1D1D]";

  const loading = !hasInitialized || isRiskLoading || loadingExtras;
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton rounded-lg"></div>
            <div className="h-4 w-32 skeleton rounded-md"></div>
          </div>
          <div className="h-10 w-10 skeleton rounded-full"></div>
        </div>
        <div className="h-64 w-full skeleton rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 w-full skeleton rounded-3xl"></div>
          <div className="h-48 w-full skeleton rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-[#B91C1C]" />
        <p className="text-[#172018] text-lg font-semibold">{error}</p>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#172018] tracking-tight">
            Hello, {user?.user_metadata?.full_name?.split(" ")[0] || "Guardian"}
          </h1>
          <p className="text-[#4B5563] flex items-center gap-1.5 mt-1 text-sm font-medium">
            <MapPin className="h-4 w-4 text-[#15803D]" /> {locationName || "Detecting Area..."}
          </p>
        </div>
        <Link href="/profile">
          <div className="h-10 w-10 rounded-full bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center transition-all hover:bg-[#F0FDF4]">
            <User className="h-5 w-5 text-[#15803D]" />
          </div>
        </Link>
      </div>

      {/* Main Risk Widget — LIVE from backend */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className={`neo-card overflow-hidden border-t-4 ${riskBorderClass} relative bg-[#FFFFFF]`}>
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3">
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${riskBadgeBg}`}>
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Live AI Monitoring Active
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#172018] tracking-tight">{currentRisk}<span className="text-xl md:text-2xl text-[#6B7280] font-semibold">/100</span></h2>
              <p className="text-lg text-[#172018] font-semibold">Current Area Risk: <span className={`${riskColorClass} font-bold`}>{riskLevel}</span></p>
              {/* @ts-ignore */}
              {riskData?.xai_reasons?.[0] && <p className="text-[#4B5563] max-w-md text-sm font-normal leading-relaxed">{riskData.xai_reasons[0]}</p>}
              {/* @ts-ignore */}
              {riskData?.confidence && <p className="text-xs text-[#6B7280] font-medium">AI Confidence Score: {Math.round(riskData.confidence * 100)}%</p>}
            </div>
            <div className="w-full md:w-auto flex flex-col gap-3">
              <Link href="/map">
                <Button className="w-full md:w-64 h-12 text-base font-semibold bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] shadow-sm">
                  <Navigation2 className="mr-2 h-5 w-5" /> Start SafeRoute
                </Button>
              </Link>
              <Link href="/emergency">
                <Button variant="secondary" className="w-full md:w-64 h-12 text-base font-semibold">
                  <Activity className="mr-2 h-5 w-5 text-[#15803D]" /> Safety Pulse
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guardian Status — LIVE from backend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="neo-card h-full bg-[#FFFFFF]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-[#172018]">Guardian Circle</CardTitle>
              <Link href="/guardians"><Button variant="ghost" size="sm" className="h-8 text-[#15803D] hover:text-[#14532D] hover:bg-[#DCFCE7] font-semibold px-3">Manage</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {guardians.length === 0 ? (
                <p className="text-sm text-[#6B7280] font-medium">No live contacts configured. Add trusted contacts.</p>
              ) : (
                guardians.slice(0, 3).map((g, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 bg-[#F0F5F1] rounded-xl border border-[#DDE8DF]">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold">{(g.name || "G")[0]}</div>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#15803D] border-2 border-[#FFFFFF]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#172018]">{g.name}</p>
                      <p className="text-xs text-[#4B5563]">{g.relation} — Alert Ready</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Prediction — LIVE from backend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="neo-card h-full relative overflow-hidden bg-[#FFFFFF]">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="h-24 w-24 text-[#15803D]" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#172018] flex items-center">
                <Zap className="h-5 w-5 mr-2 text-[#15803D]" />
                AI Risk Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forecast?.forecasts?.[0] ? (
                <>
                  <p className="text-sm text-[#172018] font-semibold mb-1">
                    Predicted shift to {forecast.forecasts[0].forecast_risk_score}/100 ({forecast.forecasts[0].risk_level}) in 15 mins.
                  </p>
                  {forecast.forecasts[1] && (
                    <p className="text-xs text-[#6B7280] mb-4 font-medium">
                      30 min forecast: {forecast.forecasts[1].forecast_risk_score}/100 ({forecast.forecasts[1].risk_level})
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#6B7280] font-medium mb-1">No forecast data available.</p>
              )}
              <Link href="/map" className="text-sm text-[#15803D] hover:text-[#166534] font-semibold inline-flex items-center">
                View Timeline <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Crime Intelligence + Recent Reports Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crime Intelligence Stats */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="neo-card h-full bg-[#FFFFFF]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#172018] flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-[#15803D]" />
                Crime Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {crimeStats && !crimeStats.is_historical_data_available ? (
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-[#B91C1C]">Historical crime dataset unavailable.</p>
                  <p className="text-xs text-[#7F1D1D] mt-1">No verified historical crime records available for this area.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F0F5F1] rounded-xl p-3.5 border border-[#DDE8DF] text-center">
                      <p className="text-2xl font-black text-[#172018]">{crimeStats?.total_nearby_crimes ?? 0}</p>
                      <p className="text-xs font-semibold text-[#4B5563]">Nearby Records</p>
                    </div>
                    <div className="bg-[#F0F5F1] rounded-xl p-3.5 border border-[#DDE8DF] text-center">
                      <p className="text-2xl font-black text-[#172018]">{crimeStats?.avg_severity ?? 0}</p>
                      <p className="text-xs font-semibold text-[#4B5563]">Avg Severity</p>
                    </div>
                  </div>
                  {crimeStats?.top_crime_type && crimeStats.top_crime_type !== "NONE" && (
                    <p className="text-xs text-[#4B5563] font-medium">Most prevalent: <span className="text-[#B45309] font-semibold">{crimeStats.top_crime_type.replace("_", " ")}</span></p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Community Reports */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="neo-card h-full bg-[#FFFFFF]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-[#172018] flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-[#B45309]" />
                Recent Reports
              </CardTitle>
              <Link href="/community"><Button variant="ghost" size="sm" className="h-8 text-[#15803D] hover:text-[#14532D] hover:bg-[#DCFCE7] font-semibold px-3">View All</Button></Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.length === 0 ? (
                <p className="text-sm text-[#6B7280] font-medium">No recent reports in area.</p>
              ) : (
                reports.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2.5 bg-[#F0F5F1] rounded-xl border border-[#DDE8DF]">
                    <div className={`h-2.5 w-2.5 rounded-full ${r.severity >= 4 ? 'bg-[#B91C1C]' : 'bg-[#B45309]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#172018] truncate">{r.category?.replace("_", " ") || r.type}</p>
                      <p className="text-xs text-[#4B5563] truncate">{r.description}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'VERIFIED' ? 'bg-[#DCFCE7] text-[#14532D]' : 'bg-[#FEF3C7] text-[#78350F]'}`}>
                      {r.status || "PENDING"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Safe Havens Row */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="neo-card bg-[#FFFFFF]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#172018] flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-[#15803D]" /> Nearby Safe Havens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {places && places.nearby_safe_havens ? (
              <div className="flex flex-wrap gap-2">
                {places.nearby_safe_havens.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="bg-[#DCFCE7] border border-[#86EFAC] rounded-full px-3.5 py-1.5 text-xs text-[#14532D] flex items-center font-semibold">
                    <span className="font-bold mr-1.5">{p.type === 'police' ? '👮' : p.type === 'hospital' ? '🏥' : '🏢'}</span>
                    {p.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280] font-medium">No live safe havens nearby.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
