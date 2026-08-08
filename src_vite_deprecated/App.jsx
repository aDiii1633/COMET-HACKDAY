import React, { useEffect, useState } from 'react';
import { Shield, PlusCircle, Users, Eye, Sparkles, Navigation } from 'lucide-react';
import { MapContainer } from './components/map/MapContainer';
import { RouteSelector } from './components/navigation/RouteSelector';
import { FutureRiskSlider } from './components/navigation/FutureRiskSlider';
import { SafetyPulseWidget } from './components/pulse/SafetyPulseWidget';
import { EscalationCountdown } from './components/pulse/EscalationCountdown';
import { GuardianCard } from './components/guardian/GuardianCard';
import { LiveTrackingView } from './components/guardian/LiveTrackingView';
import { CommunityReportModal } from './components/community/CommunityReportModal';
import { Modal } from './components/common/Modal';
import { useRouteStore } from './store/useRouteStore';
import { useSafetyStore } from './store/useSafetyStore';
import { useUserStore } from './store/useUserStore';
import { fetchNavigationRoutes } from './services/mapbox';
import { generateXaiExplanation } from './services/xaiSynthesizer';
import { triggerHaptic } from './utils/hapticManager';

export default function App() {
  const { origin, destination, setRoutes, selectedRouteId, isNavigating, setIsNavigating } = useRouteStore();
  const { setEscalationState, resetEscalation, setRiskState } = useSafetyStore();
  const { user } = useUserStore();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGuardianOpen, setIsGuardianOpen] = useState(false);
  const [isLiveTrackingOpen, setIsLiveTrackingOpen] = useState(false);
  const [isXaiModalOpen, setIsXaiModalOpen] = useState(false);
  const [xaiData, setXaiData] = useState(null);

  // Initialize navigation routes
  useEffect(() => {
    async function loadRoutes() {
      const data = await fetchNavigationRoutes(origin, destination);
      setRoutes(data);
    }
    loadRoutes();
  }, []);

  const handleStartNavigation = () => {
    triggerHaptic('success');
    setIsNavigating(true);
    setRiskState(14, 'SAFE');
  };

  const handleSimulateDanger = () => {
    triggerHaptic('danger_level2');
    setRiskState(78, 'DANGER');
    setEscalationState('LEVEL2_ESCALATION');
  };

  const handleOpenXaiExplanation = async (score = 78) => {
    triggerHaptic('light');
    const result = await generateXaiExplanation(score, { illuminationScore: 12, crowdSparsityScore: 4, communityScore: 84 });
    setXaiData(result);
    setIsXaiModalOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050507] text-[#F9FAFB] flex flex-col">
      {/* Top Floating Glass Header */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between p-3 rounded-full glass-card border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-none">SafeSphere AI</h1>
            <p className="text-[10px] font-mono text-indigo-300">Predict Danger Before It Happens</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsReportModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Report Hazard</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setIsGuardianOpen(!isGuardianOpen);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-indigo-400 border border-white/10"
            aria-label="Guardian Circle"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Map Canvas Layer */}
      <main className="relative flex-1 w-full h-full">
        <MapContainer onSelectSegment={() => handleOpenXaiExplanation(78)} />

        {/* Overlay Controls & Bottom Navigation Sheets */}
        <div className="absolute inset-x-4 bottom-6 z-30 max-w-lg mx-auto space-y-3 pointer-events-auto">
          {isNavigating ? (
            <SafetyPulseWidget onSimulateDanger={handleSimulateDanger} />
          ) : (
            <>
              <FutureRiskSlider />
              <div className="glass-card p-4 border border-white/10">
                <RouteSelector
                  onStartNavigation={handleStartNavigation}
                  onOpenXaiModal={() => handleOpenXaiExplanation(78)}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Guardian Drawer */}
      {isGuardianOpen && (
        <div className="absolute top-20 right-4 z-40 w-full max-w-sm">
          <GuardianCard onAddGuardian={() => setIsLiveTrackingOpen(true)} />
        </div>
      )}

      {/* Level 2 Escalation Countdown Alert Modal */}
      <EscalationCountdown
        onCancel={() => resetEscalation()}
        onAlertDispatched={() => setIsLiveTrackingOpen(true)}
      />

      {/* Guardian Live Tracking Dashboard */}
      {isLiveTrackingOpen && (
        <LiveTrackingView onClose={() => setIsLiveTrackingOpen(false)} />
      )}

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Explainable AI (XAI) Insight Modal */}
      <Modal
        isOpen={isXaiModalOpen}
        onClose={() => setIsXaiModalOpen(false)}
        title="Explainable AI (XAI) Risk Rationale"
      >
        {xaiData && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 rounded-2xl bg-black/60 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-gray-400 uppercase">Composite Risk Score</span>
                <h4 className="text-xl font-bold text-rose-400 font-mono">{xaiData.compositeScore}/100 ({xaiData.riskLevel})</h4>
              </div>
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Primary Risk Drivers</h4>
              <div className="space-y-2">
                {xaiData.primaryDrivers.map((driver, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-200 leading-relaxed">{driver}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsXaiModalOpen(false)}
              className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              Understood — Close Rationale
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
