"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, PhoneCall, Navigation, X, Home, Building2, Stethoscope, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { guardiansApi, placesApi } from "@/lib/api/services";

interface SafeHavenOverlayProps {
  currentLat: number;
  currentLng: number;
  onSelectSafeHaven: (location: { lat: number; lng: number; name: string; type: string }) => void;
  onClose: () => void;
}

export function SafeHavenOverlay({ currentLat, currentLng, onSelectSafeHaven, onClose }: SafeHavenOverlayProps) {
  const [activeTab, setActiveTab] = useState<"guardians" | "police" | "hospital">("guardians");
  const [guardians, setGuardians] = useState<Array<{ name: string; relation: string; phone_number: string; latitude?: number; longitude?: number; address?: number }>>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{ name: string; type: string; vicinity?: string; geometry?: { location: { lat: number; lng: number } } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === "guardians") {
          const list = await guardiansApi.list();
          setGuardians(list);
        } else {
          const res = await placesApi.emergencyNearby(currentLat, currentLng);
          if (res && res.nearby_safe_havens) {
            setNearbyPlaces(res.nearby_safe_havens.filter((p: any) => activeTab === "police" ? p.type === "police" : p.type === "hospital"));
          }
        }
      } catch (err) {
        console.error("SafeHaven data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab, currentLat, currentLng]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="neo-card bg-[#FFFFFF] border-2 border-[#15803D] shadow-2xl overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="bg-[#15803D] p-4 text-[#FFFFFF] flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-[#86EFAC] animate-pulse" />
            <div>
              <h3 className="font-bold text-base tracking-tight">Guardian Safe Haven System</h3>
              <p className="text-xs text-[#DCFCE7] font-medium">Select a verified sanctuary for emergency rerouting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#166534] rounded-full transition-colors">
            <X className="h-5 w-5 text-[#FFFFFF]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB] p-1.5 gap-1">
          <button
            onClick={() => setActiveTab("guardians")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "guardians" ? "bg-[#FFFFFF] text-[#15803D] shadow-sm border border-[#DDE8DF]" : "text-[#6B7280] hover:text-[#172018]"
            }`}
          >
            <Home className="h-3.5 w-3.5" /> Guardians
          </button>
          <button
            onClick={() => setActiveTab("police")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "police" ? "bg-[#FFFFFF] text-[#15803D] shadow-sm border border-[#DDE8DF]" : "text-[#6B7280] hover:text-[#172018]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" /> Police Stations
          </button>
          <button
            onClick={() => setActiveTab("hospital")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "hospital" ? "bg-[#FFFFFF] text-[#15803D] shadow-sm border border-[#DDE8DF]" : "text-[#6B7280] hover:text-[#172018]"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" /> Hospitals
          </button>
        </div>

        {/* Content Area */}
        <CardContent className="p-4 max-h-64 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#6B7280] font-semibold animate-pulse">
              Locating nearest verified havens...
            </div>
          ) : activeTab === "guardians" ? (
            guardians.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">
                No guardian locations configured yet. Add them in Guardian Circle settings.
              </div>
            ) : (
              guardians.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#F0F5F1] rounded-2xl border border-[#DDE8DF]">
                  <div>
                    <p className="text-sm font-bold text-[#172018]">{g.name} ({g.relation})</p>
                    <p className="text-xs text-[#4B5563]">{g.phone_number}</p>
                  </div>
                  {g.latitude && g.longitude ? (
                    <Button
                      size="sm"
                      onClick={() => onSelectSafeHaven({ lat: g.latitude!, lng: g.longitude!, name: `${g.name}'s Place`, type: "guardian" })}
                      className="bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] text-xs font-bold"
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1" /> Route Here
                    </Button>
                  ) : (
                    <span className="text-[10px] text-[#9CA3AF] italic">No GPS set</span>
                  )}
                </div>
              ))
            )
          ) : (
            nearbyPlaces.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">
                Searching active Google Places network...
              </div>
            ) : (
              nearbyPlaces.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#F0F5F1] rounded-2xl border border-[#DDE8DF]">
                  <div>
                    <p className="text-sm font-bold text-[#172018]">{p.name}</p>
                    <p className="text-xs text-[#4B5563] capitalize">{p.type} Sanctuary</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectSafeHaven({ 
                      lat: p.geometry?.location?.lat || currentLat + 0.005, 
                      lng: p.geometry?.location?.lng || currentLng + 0.005, 
                      name: p.name, 
                      type: p.type 
                    })}
                    className="bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] text-xs font-bold"
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1" /> Reroute
                  </Button>
                </div>
              ))
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
