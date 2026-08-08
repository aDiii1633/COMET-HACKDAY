import { create } from 'zustand';
import { riskApi, placesApi } from '@/lib/api/services';
import toast from 'react-hot-toast';

interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string | null;
  riskData: { risk_score: number; risk_level: string } | null;
  isLocating: boolean;
  isRiskLoading: boolean;
  error: string | null;
  hasInitialized: boolean;
  
  initializeLocation: () => Promise<void>;
  setLocationManually: (lat: number, lng: number, address: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  lat: null,
  lng: null,
  address: null,
  riskData: null,
  isLocating: false,
  isRiskLoading: false,
  error: null,
  hasInitialized: false,

  initializeLocation: async () => {
    if (get().isLocating || get().hasInitialized) return;
    
    set({ isLocating: true, error: null });

    if (!navigator.geolocation) {
      set({ 
        isLocating: false, 
        error: "Geolocation is not supported by your browser",
        hasInitialized: true
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          timeout: 10000,
          enableHighAccuracy: true 
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      set({ lat, lng, isLocating: false, isRiskLoading: true });

      // Fetch Risk & Reverse Geocode concurrently
      const [riskRes, geocodeRes] = await Promise.allSettled([
        riskApi.evaluate(lat, lng),
        placesApi.reverseGeocode(lat, lng)
      ]);

      const updates: Partial<LocationState> = { isRiskLoading: false, hasInitialized: true };
      
      if (riskRes.status === 'fulfilled') {
        updates.riskData = riskRes.value;
      }
      
      if (geocodeRes.status === 'fulfilled' && geocodeRes.value.address) {
        updates.address = geocodeRes.value.address;
      }

      set(updates);

    } catch (err: any) {
      console.warn("Geolocation denied or failed:", err);
      // Fallback for demo purposes if permission denied
      const fallbackLat = 28.6139;
      const fallbackLng = 77.2090;
      set({ 
        lat: fallbackLat, 
        lng: fallbackLng, 
        isLocating: false, 
        error: "Location permission denied. Using default area.",
        hasInitialized: true,
        isRiskLoading: true
      });
      
      try {
        const risk = await riskApi.evaluate(fallbackLat, fallbackLng);
        set({ riskData: risk, isRiskLoading: false, address: "Central Area (Default)" });
      } catch (e) {
        set({ isRiskLoading: false });
      }
    }
  },

  setLocationManually: async (lat: number, lng: number, address: string) => {
    set({ lat, lng, address, isRiskLoading: true, error: null, hasInitialized: true });
    try {
      const risk = await riskApi.evaluate(lat, lng);
      set({ riskData: risk, isRiskLoading: false });
    } catch (error) {
      set({ isRiskLoading: false });
      toast.error("Failed to load risk data for selected location.");
    }
  }
}));
