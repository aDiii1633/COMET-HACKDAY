"use client";

import { useState, useEffect, useRef } from "react";
import { APIProvider, Map as GoogleMap, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, ShieldAlert, Compass, Loader2, Activity, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlacesAutocomplete } from "@/components/map/PlacesAutocomplete";
import { riskApi, crimeApi, reportsApi, routeApi, aiApi } from "@/lib/api/services";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useCompanionState } from "@/store/useCompanionState";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { useLocationStore } from "@/store/useLocationStore";

const MAP_ID = "DEMO_MAP_ID";

function HeatmapComponent({ crimes, reports }: { crimes: Array<{lat: number, lng: number, severity: number}>, reports: Array<{latitude: number, longitude: number, severity: number}> }) {
  const map = useMap();
  const visualization = useMapsLibrary("visualization");
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !visualization) return;

    const data: Array<{location: google.maps.LatLng, weight: number}> = [];
    crimes.forEach(c => {
      data.push({
        location: new google.maps.LatLng(c.lat, c.lng),
        weight: c.severity * 2
      });
    });
    reports.forEach(r => {
      data.push({
        location: new google.maps.LatLng(r.latitude, r.longitude),
        weight: r.severity * 3
      });
    });

    if (heatmapRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (heatmapRef.current as any).setData(data);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const HeatmapLayerClass: any = visualization.HeatmapLayer;
      heatmapRef.current = new HeatmapLayerClass({
        data,
        map,
        radius: 40,
        opacity: 0.6,
        gradient: [
          "rgba(0, 255, 255, 0)",
          "rgba(0, 255, 255, 1)",
          "rgba(0, 191, 255, 1)",
          "rgba(0, 127, 255, 1)",
          "rgba(0, 63, 255, 1)",
          "rgba(0, 0, 255, 1)",
          "rgba(0, 0, 223, 1)",
          "rgba(0, 0, 191, 1)",
          "rgba(0, 0, 159, 1)",
          "rgba(0, 0, 127, 1)",
          "rgba(63, 0, 91, 1)",
          "rgba(127, 0, 63, 1)",
          "rgba(191, 0, 31, 1)",
          "rgba(255, 0, 0, 1)"
        ]
      });
    }

    return () => {
      if (heatmapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (heatmapRef.current as any).setMap(null);
      }
    };
  }, [map, visualization, crimes, reports]);

  return null;
}

function PolylineLayer({ coords, color }: { coords: number[][], color: string }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !window.google) return;
    const path = coords.map(c => ({ lat: c[1], lng: c[0] }));
    
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        map,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 6,
      });
    } else {
      polylineRef.current.setPath(path);
      polylineRef.current.setOptions({ strokeColor: color });
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, coords, color]);

  // Fit bounds to polyline
  useEffect(() => {
    if (!map || !window.google || !coords || coords.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    coords.forEach(c => {
      bounds.extend(new google.maps.LatLng(c[1], c[0]));
    });
    map.fitBounds(bounds);
  }, [map, coords]);

  return null;
}

export default function MapPage() {
  const { lat, lng, address: locationName, riskData, initializeLocation, hasInitialized } = useLocationStore();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [crimes, setCrimes] = useState<Array<{lat: number, lng: number, severity: number}>>([]);
  const [reports, setReports] = useState<Array<{latitude: number, longitude: number, severity: number}>>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const companionState = useCompanionState();
  const geminiLive = useGeminiLive();
  console.log("CLIENT API KEY:", apiKey);

  // Safe Route State
  const [showSearch, setShowSearch] = useState(false);
  const [destInput, setDestInput] = useState("");
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [routesData, setRoutesData] = useState<any>(null);

  // Area Intelligence State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedArea, setSelectedArea] = useState<any>(null);

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  useEffect(() => {
    async function fetchMapData() {
      if (!hasInitialized || lat === null || lng === null) return;
      try {
        setLoadingExtras(true);
        const [crimeData, repData] = await Promise.all([
          crimeApi.nearby(lat, lng, 5),
          reportsApi.list(20),
        ]);
        setCrimes(crimeData);
        setReports(repData);
      } catch (e) {
        console.error("Map data load error:", e);
      } finally {
        setLoadingExtras(false);
      }
    }
    fetchMapData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized, lat, lng]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapClick = async (e: any) => {
    const clickLat = e.detail.latLng.lat;
    const clickLng = e.detail.latLng.lng;
    
    if (routesData) {
      // Simulate GPS movement/Risk Zone Detection during navigation
      try {
        const [risk] = await Promise.all([riskApi.evaluate(clickLat, clickLng)]);
        if (risk.risk_score >= 60) {
          toast.error("Simulated: Approaching Risk Zone");
          geminiLive.sendSystemEvent(`RISK_ZONE_APPROACHING. Risk Score is ${risk.risk_score} (Danger). Tell the user they are approaching an area with higher historical crime exposure. Remind them you are with them.`);
        } else {
          toast.success("Simulated: Deviated from route");
          geminiLive.sendSystemEvent(`ROUTE_DEVIATED. The user has deviated from the active SafeRoute. Ask if they want you to recalculate.`);
        }
      } catch (e) { }
      return; 
    }
    
    setSelectedArea({ loading: true, lat: clickLat, lng: clickLng });
    try {
      const [risk, stats, areaName] = await Promise.all([
        riskApi.evaluate(clickLat, clickLng),
        crimeApi.stats(clickLat, clickLng),
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${clickLat},${clickLng}&key=${apiKey}`).then(r => r.json()).then(d => d.results?.[0]?.formatted_address || "Unknown Area")
      ]);
      const context = { risk_score: risk.risk_score, risk_level: risk.risk_level, community_reports_count: stats.total_nearby_crimes };
      const explanation = await aiApi.chat("Explain the risk of this exact area.", context);
      
      setSelectedArea({ loading: false, lat: clickLat, lng: clickLng, risk, stats, explanation, areaName });
    } catch {
      setSelectedArea(null);
    }
  };

  const calculateRoute = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const destCoords = (window as any)._destCoords;
    if (!destInput || !destCoords) {
      toast.error("Please select a valid destination from the dropdown.");
      return;
    }
    setCalculatingRoute(true);
    companionState.setExpression("thinking");
    companionState.triggerGesture("thinking", 10000);
    try {
      const destLat = destCoords.lat;
      const destLng = destCoords.lng;
      const data = await routeApi.calculate(lat || 28.6139, lng || 77.2090, destLat, destLng);
      setRoutesData(data);
      setShowSearch(false);
      companionState.setExpression("happy");
      companionState.triggerGesture("point", 3000);
      companionState.showSpeech("This is the safest route!", 4000);
    } catch (_e) {
      toast.error("Failed to calculate route.");
      companionState.setExpression("concerned");
    } finally {
      setCalculatingRoute(false);
    }
  };

  const startJourney = async (routeId: string) => {
    try {
      await routeApi.startJourney(destInput, 20, routeId);
      toast.success("Journey started! Safety Companion Active.");
      companionState.setExpression("celebrating");
      
      // Auto-start Gemini Live Voice Companion
      if (!geminiLive.isConnected) {
        geminiLive.toggleListening();
        setTimeout(() => {
          geminiLive.sendSystemEvent("JOURNEY_STARTED. You are now the user's personal safety companion for their journey. Briefly introduce yourself and say you're monitoring the route.");
        }, 2000); // Wait for connection
      }
    } catch (_e) {
      toast.error("Failed to start journey.");
    }
  };

  const riskLevel = riskData?.risk_level ?? "SAFE";
  const riskScore = riskData?.risk_score ?? 0;
  const riskColor = riskLevel === "SAFE" ? "text-[#14532D]" : riskLevel === "WARNING" ? "text-[#78350F]" : "text-[#7F1D1D]";
  const loading = !hasInitialized || loadingExtras;
  const center = { lat: lat || 28.6139, lng: lng || 77.2090 };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] relative overflow-hidden rounded-2xl border border-[#DDE8DF] shadow-md bg-[#FFFFFF]">
      {/* Floating Header Card */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="bg-[#FFFFFF] border border-[#DDE8DF] shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172018] flex items-center">
                <Compass className="h-5 w-5 mr-2 text-[#15803D]" /> Live Risk Map
              </h2>
              <p className="text-xs text-[#4B5563] mt-1 font-medium">
                Area Risk: <span className={`font-bold ${riskColor}`}>{riskScore}/100 ({riskLevel})</span>
              </p>
            </div>
            {loading && <Loader2 className="h-5 w-5 text-[#15803D] animate-spin" />}
          </CardContent>
        </Card>
      </div>

      {/* Google Maps */}
      <APIProvider apiKey={apiKey} version="3.64">
        <div className="w-full h-full">
          <GoogleMap 
            center={center} 
            defaultZoom={14} 
            disableDefaultUI={true} 
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            <HeatmapComponent crimes={crimes} reports={reports} />
            
            <Marker position={center} />

            {routesData && routesData.safest_route && (
              <PolylineLayer coords={routesData.safest_route.geometry.coordinates} color="#15803d" />
            )}
            
            {routesData && routesData.alternative_routes?.[0] && (
              <PolylineLayer coords={routesData.alternative_routes[0].geometry.coordinates} color="#b91c1c" />
            )}
          </GoogleMap>
        </div>
      </APIProvider>

      {/* Safe Route Search Overlay */}
      <AnimatePresence>
        {showSearch && !routesData && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-24 left-4 right-4 z-20">
            <Card className="bg-[#FFFFFF] border border-[#DDE8DF] shadow-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#172018]">Where to?</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[#6B7280] hover:text-[#172018]" onClick={() => setShowSearch(false)}><X className="h-4 w-4" /></Button>
                </div>
                <Input 
                  value={locationName ? `Current Location: ${locationName}` : "Detecting current location..."}
                  disabled
                  className="bg-[#F3F4F6] text-[#4B5563] font-medium"
                />
                <PlacesAutocomplete 
                  onPlaceSelect={(place) => {
                    if (place && place.geometry && place.geometry.location) {
                      setDestInput(place.formatted_address || place.name || "");
                      // Store coords for route calculation
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (window as any)._destCoords = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      };
                    }
                  }}
                  placeholder="Search destination..." 
                  className="bg-[#FFFFFF]" 
                />
                <Button onClick={calculateRoute} disabled={calculatingRoute || !destInput} className="w-full bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold">
                  {calculatingRoute ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                  Find Safe Routes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Route Results Bottom Sheet */}
      <AnimatePresence>
        {calculatingRoute && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-[#FFFFFF]/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-[#FFFFFF] border border-[#DDE8DF] shadow-xl p-6 flex flex-col items-center max-w-sm w-full rounded-2xl">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-[#15803D]/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute inset-0 border-4 border-[#15803D] rounded-full border-t-transparent animate-spin"></div>
                <Activity className="absolute inset-0 m-auto h-6 w-6 text-[#15803D] animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-[#172018] mb-2">Analyzing Routes...</h3>
              <p className="text-sm text-[#4B5563] animate-slow-pulse">Evaluating historical crime density, illumination data, and live reports for your safest path.</p>
            </div>
          </motion.div>
        )}
        
        {routesData && !calculatingRoute && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-20 p-4">
            <Card className="bg-[#FFFFFF] border border-[#DDE8DF] border-t-4 border-t-[#15803D] shadow-xl">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#172018] text-lg font-bold">Route Options</CardTitle>
                  <p className="text-xs text-[#4B5563] mt-1 font-medium">{routesData.risk_comparison.recommendation}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setRoutesData(null)}><X className="h-5 w-5 text-[#6B7280]" /></Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#DCFCE7] border border-[#86EFAC] p-3.5 rounded-xl flex flex-col space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2"><span className="text-[10px] font-bold bg-[#15803D] text-[#FFFFFF] px-2 py-0.5 rounded-full">RECOMMENDED</span></div>
                  <div className="flex justify-between items-center pr-20">
                    <h4 className="font-bold text-[#14532D] text-sm">Safest Route</h4>
                    <span className="text-[#15803D] font-bold">{routesData.safest_route.risk_score}% Risk</span>
                  </div>
                  <p className="text-xs text-[#166534] font-medium">{Math.round(routesData.safest_route.duration_seconds / 60)} mins • {routesData.safest_route.xai_summary}</p>
                  <Button size="sm" onClick={() => startJourney(routesData.safest_route.id)} className="w-full bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold mt-1">Start SafeRoute</Button>
                </div>

                {routesData.alternative_routes?.[0] && (
                  <div className="bg-[#F0F5F1] border border-[#DDE8DF] p-3.5 rounded-xl flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[#172018] text-sm">Fastest Alternative</h4>
                      <span className="text-[#B91C1C] font-bold">{routesData.alternative_routes[0].risk_score}% Risk</span>
                    </div>
                    <p className="text-xs text-[#4B5563]">{Math.round(routesData.alternative_routes[0].duration_seconds / 60)} mins • {routesData.alternative_routes[0].xai_summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Area Intelligence Bottom Sheet */}
      <AnimatePresence>
        {selectedArea && !routesData && !showSearch && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-4 left-4 right-4 z-20">
            <Card className="bg-[#FFFFFF] border border-[#DDE8DF] shadow-xl">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#172018] text-lg font-bold flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-[#15803D]" /> {selectedArea.areaName || "Area Intelligence"}
                  </CardTitle>
                  {selectedArea.areaName && <p className="text-xs text-[#6B7280] mt-1 truncate max-w-[280px]">{selectedArea.lat.toFixed(4)}, {selectedArea.lng.toFixed(4)}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedArea(null)}><X className="h-5 w-5 text-[#6B7280]" /></Button>
              </CardHeader>
              <CardContent>
                {selectedArea.loading ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 text-[#15803D] animate-spin" /></div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#4B5563] font-medium">Risk Score</span>
                      <span className={`font-bold ${selectedArea.risk.risk_level === 'SAFE' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>{selectedArea.risk.risk_score}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#4B5563] font-medium">Historical Records</span>
                      {selectedArea.stats.is_historical_data_available ? (
                        <span className="font-semibold text-[#172018]">{selectedArea.stats.total_nearby_crimes} records</span>
                      ) : (
                        <span className="text-xs font-semibold text-[#B91C1C]">Historical crime dataset unavailable.</span>
                      )}
                    </div>
                    <div className="bg-[#DCFCE7] border border-[#86EFAC] p-3 rounded-lg mt-2">
                      <p className="text-xs text-[#14532D] leading-relaxed flex items-start font-medium">
                        <Activity className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-[#15803D] shrink-0" />
                        {selectedArea.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Action Sheet */}
      {!routesData && !showSearch && !selectedArea && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
          <Button onClick={() => setShowSearch(true)} className="flex-1 bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold h-12 rounded-xl shadow-md">
            <Navigation className="mr-2 h-5 w-5" /> Search SafeRoute
          </Button>
          <Link href="/emergency">
            <Button variant="destructive" className="h-12 w-12 rounded-xl shadow-md shrink-0 bg-[#B91C1C] hover:bg-[#991B1B]">
              <ShieldAlert className="h-5 w-5 text-[#FFFFFF]" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
