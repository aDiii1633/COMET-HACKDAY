import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "id"> & { id?: string }) => void;
  updateMessage: (id: string, text: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: "1",
      role: "assistant",
      text: "Hi! I'm SafeSphere AI. I can analyze your current location, suggest safe routes, and give safety insights. How can I help?",
    },
  ],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: msg.id || Date.now().toString() }],
    })),
  updateMessage: (id, text) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, text } : m)),
    })),
  clearMessages: () =>
    set(() => ({
      messages: [
        {
          id: "1",
          role: "assistant",
          text: "Hi! I'm SafeSphere AI. I can analyze your current location, suggest safe routes, and give safety insights. How can I help?",
        },
      ],
    })),
}));
