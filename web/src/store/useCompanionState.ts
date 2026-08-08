import { create } from "zustand";

export type Expression = "idle" | "happy" | "concerned" | "thinking" | "serious" | "greeting" | "celebrating";
export type Gesture = "none" | "wave" | "point" | "thumbsUp" | "thinking" | "explain";

interface CompanionState {
  expression: Expression;
  gesture: Gesture;
  isVisible: boolean;
  isChatMode: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  speechText: string | null;

  setExpression: (expression: Expression) => void;
  triggerGesture: (gesture: Gesture, durationMs?: number) => void;
  showSpeech: (text: string, durationMs?: number) => void;
  clearSpeech: () => void;
  setChatMode: (isChatMode: boolean) => void;
  setVisible: (isVisible: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setListening: (isListening: boolean) => void;
}

export const useCompanionState = create<CompanionState>((set) => ({
  expression: "idle",
  gesture: "none",
  isVisible: true,
  isChatMode: false,
  isSpeaking: false,
  isListening: false,
  speechText: null,

  setExpression: (expression) => set({ expression }),

  triggerGesture: (gesture, durationMs = 2000) => {
    set({ gesture });
    setTimeout(() => set({ gesture: "none" }), durationMs);
  },

  showSpeech: (text, durationMs = 4000) => {
    set({ speechText: text });
    if (durationMs > 0) {
      setTimeout(() => set({ speechText: null }), durationMs);
    }
  },

  clearSpeech: () => set({ speechText: null }),

  setChatMode: (isChatMode) => set({ isChatMode }),

  setVisible: (isVisible) => set({ isVisible }),

  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  
  setListening: (isListening) => set({ isListening }),
}));
