import { create } from 'zustand';

export const useSafetyStore = create((set) => ({
  currentRiskScore: 14, // 0 - 100
  currentRiskLevel: 'SAFE', // 'SAFE' | 'WARNING' | 'DANGER'
  proximityThreat: null, // Threat object if near danger zone
  escalationState: 'NORMAL', // 'NORMAL' | 'LEVEL1_WARNING' | 'LEVEL2_ESCALATION' | 'ALERT_SENT'
  countdownSeconds: 15,
  communityReports: [
    {
      reportId: 'rep_101',
      category: 'POOR_LIGHTING',
      severity: 4,
      description: 'Streetlights non-functional behind transit corridor.',
      latitude: 37.778200,
      longitude: -122.414100,
      h3Index: '8928308280fffff',
      timestamp: '2026-08-03T12:45:00Z',
      verificationCount: 8,
      status: 'VERIFIED'
    },
    {
      reportId: 'rep_102',
      category: 'HARASSMENT_HOTSPOT',
      severity: 5,
      description: 'Multiple late-night verbal harassment incidents reported in alley.',
      latitude: 37.776500,
      longitude: -122.416200,
      h3Index: '8928308284fffff',
      timestamp: '2026-08-03T11:20:00Z',
      verificationCount: 14,
      status: 'VERIFIED'
    }
  ],

  setRiskState: (score, level) => set({ currentRiskScore: score, currentRiskLevel: level }),
  setProximityThreat: (threat) => set({ proximityThreat: threat }),
  setEscalationState: (state) => set({ escalationState: state }),
  setCountdownSeconds: (sec) => set({ countdownSeconds: sec }),
  
  addCommunityReport: (report) => set((state) => ({
    communityReports: [report, ...state.communityReports]
  })),

  decrementCountdown: () => set((state) => ({
    countdownSeconds: Math.max(0, state.countdownSeconds - 1)
  })),

  resetEscalation: () => set({
    escalationState: 'NORMAL',
    countdownSeconds: 15,
    proximityThreat: null
  })
}));
