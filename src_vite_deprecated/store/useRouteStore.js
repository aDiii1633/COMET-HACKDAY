import { create } from 'zustand';

export const useRouteStore = create((set) => ({
  origin: {
    name: 'Urban General Hospital Exit',
    latitude: 37.774929,
    longitude: -122.419416,
  },
  destination: {
    name: 'Suburban Transit Station',
    latitude: 37.783325,
    longitude: -122.408010,
  },
  routes: [],
  selectedRouteId: 'route_alpha_safest',
  futureRiskMinutes: 0, // 0, 15, 30, 45, 60
  isNavigating: false,
  activeStepIndex: 0,
  selectedXaiSegment: null,

  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setRoutes: (routes) => set({ routes }),
  setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),
  setFutureRiskMinutes: (futureRiskMinutes) => set({ futureRiskMinutes }),
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  setActiveStepIndex: (activeStepIndex) => set({ activeStepIndex }),
  setSelectedXaiSegment: (selectedXaiSegment) => set({ selectedXaiSegment }),

  resetNavigation: () => set({
    isNavigating: false,
    activeStepIndex: 0,
    selectedXaiSegment: null,
  })
}));
