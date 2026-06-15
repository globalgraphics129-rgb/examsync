import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your ExamSync Assistant. How can I help you with your schedule today?",
      timestamp: new Date(),
    },
  ],
  isTyping: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() },
      ],
    })),
  setTyping: (isTyping) => set({ isTyping }),
  clearChat: () => set({ messages: [] }),
}));
