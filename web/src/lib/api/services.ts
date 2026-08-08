import { apiClient } from "./axios";

// ========== HEALTH ==========
export const healthApi = {
  async check(): Promise<{ status: string; services: { ai_chat: string } }> {
    try {
      const res = await apiClient.get("/health");
      return res.data;
    } catch {
      return { status: "offline", services: { ai_chat: "offline" } };
    }
  }
};

// ========== RISK ENGINE ==========
export const riskApi = {
  async evaluate(lat: number, lng: number, timeOffset: number = 0) {
    const res = await apiClient.post("/risk/evaluate", { latitude: lat, longitude: lng, time_offset_minutes: timeOffset });
    return res.data;
  },
  async forecast(lat: number, lng: number) {
    const res = await apiClient.get(`/risk/forecast?latitude=${lat}&longitude=${lng}`);
    return res.data;
  },
};

// ========== COMMUNITY REPORTS ==========
export const reportsApi = {
  async list(limit: number = 50) {
    const res = await apiClient.get(`/reports?limit=${limit}`);
    return res.data;
  },
  async submit(data: { category: string; severity: number; description: string; latitude: number; longitude: number; image_b64?: string }) {
    const res = await apiClient.post("/reports", data);
    return res.data;
  },
};

// ========== GUARDIANS ==========
export const guardiansApi = {
  async list() {
    const res = await apiClient.get("/guardians");
    return res.data;
  },
  async add(data: { name: string; relation: string; phone_number: string; email: string }) {
    const res = await apiClient.post("/guardians", data);
    return res.data;
  },
  async triggerAlert(lat: number, lng: number, riskScore: number) {
    const res = await apiClient.post(`/guardians/alert?latitude=${lat}&longitude=${lng}&risk_score=${riskScore}`);
    return res.data;
  },
};

// ========== EMERGENCY ==========
export const emergencyApi = {
  async trigger(lat: number, lng: number, riskScore: number) {
    const res = await apiClient.post(`/emergency/trigger?latitude=${lat}&longitude=${lng}&risk_score=${riskScore}`);
    return res.data;
  },
  async getLogs() {
    const res = await apiClient.get("/emergency/logs");
    return res.data;
  },
};

// ========== PLACES ==========
export const placesApi = {
  async emergencyNearby(lat: number, lng: number, radius: number = 2000) {
    const res = await apiClient.post("/places/emergency-nearby", { latitude: lat, longitude: lng, radius_meters: radius });
    return res.data;
  },
  async reverseGeocode(lat: number, lng: number) {
    const res = await apiClient.post("/maps/reverse-geocode", { latitude: lat, longitude: lng });
    return res.data;
  }
};

// ========== NOTIFICATIONS ==========
export const notificationsApi = {
  async list(limit: number = 50) {
    const res = await apiClient.get(`/notifications?limit=${limit}`);
    return res.data;
  },
};

// ========== DASHBOARD ==========
export const dashboardApi = {
  async getAnalytics() {
    const res = await apiClient.get("/dashboard/analytics");
    return res.data;
  },
};

// ========== AI SUMMARY ==========
export const aiApi = {
  async explainRisk(riskScore: number, riskLevel: string) {
    const res = await apiClient.post(`/ai/explain-risk?risk_score=${riskScore}&risk_level=${riskLevel}`);
    return res.data;
  },
  async guardianSummary(userName: string, areaName: string, riskScore: number) {
    const res = await apiClient.post(`/ai/guardian-summary?user_name=${userName}&area_name=${areaName}&risk_score=${riskScore}`);
    return res.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async chat(message: string, context: any) {
    const res = await apiClient.post("/ai/chat", { message, context });
    return res.data.reply;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async chatStream(message: string, context: any, onChunk: (text: string) => void, onComplete: () => void, onError: (err: any) => void) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${backendUrl}/ai/chat-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data === "[DONE]") {
                onComplete();
                return;
              } else if (data === "[ERROR]") {
                throw new Error("Stream error");
              } else {
                onChunk(data.replace(/\\n/g, "\n"));
              }
            }
          }
        }
      }
      onComplete();
    } catch (err) {
      onError(err);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async voiceChat(chatHistory: any[], context: any) {
    const res = await apiClient.post("/ai/voice-chat", { chat_history: chatHistory, context });
    return res.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async voiceProcess(audioBlob: Blob, chatHistory: any[], context: any) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("chat_history", JSON.stringify(chatHistory));
    formData.append("context", JSON.stringify(context));
    
    const res = await apiClient.post("/ai/voice-process", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }
};

// ========== CRIME DATA ==========
export const crimeApi = {
  async nearby(lat: number, lng: number, radiusKm: number = 5) {
    const res = await apiClient.get(`/crime/nearby?latitude=${lat}&longitude=${lng}&radius_km=${radiusKm}`);
    return res.data;
  },
  async stats(lat: number, lng: number) {
    const res = await apiClient.get(`/crime/stats?latitude=${lat}&longitude=${lng}`);
    return res.data;
  },
  async womenSafetyStats() {
    const res = await apiClient.get(`/crime/women-safety-stats`);
    return res.data;
  }
};

// ========== ROUTES ==========
export const routeApi = {
  async calculate(originLat: number, originLng: number, destLat: number, destLng: number) {
    const res = await apiClient.post("/routes/calculate", {
      origin: { latitude: originLat, longitude: originLng },
      destination: { latitude: destLat, longitude: destLng },
      time_offset_minutes: 0
    });
    return res.data;
  },
  async startJourney(destName: string, etaMinutes: number, routeId: string) {
    const res = await apiClient.post("/routes/start-journey", {
      destination_name: destName,
      eta_minutes: etaMinutes,
      safest_route_id: routeId
    });
    return res.data;
  },
  async endJourney() {
    const res = await apiClient.post("/routes/end-journey");
    return res.data;
  }
};
