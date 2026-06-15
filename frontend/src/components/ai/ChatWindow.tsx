import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import ChatBubble from './ChatBubble';
import api from '../../lib/api';

const ChatWindow = () => {
  const { messages, addMessage, isTyping, setTyping } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    addMessage({ role: 'user', content: userMessage });

    setTyping(true);
    try {
      const response = await api.post('/ai/chat', {
        messages: [...messages, { role: 'user', content: userMessage }],
        studentContext: user,
      });

      addMessage({ role: 'assistant', content: response.data.content });
    } catch (err) {
      addMessage({ role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." });
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-surface-container-low rounded-[2rem] overflow-hidden border border-surface-variant shadow-xl">
      {/* Header */}
      <div className="bg-primary-container p-6 text-white flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          <h3 className="font-bold">ExamSync Assistant</h3>
          <p className="text-[10px] uppercase tracking-widest opacity-60">Powered by Claude 3.5</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-on-surface-variant/30 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-on-surface-variant/30 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-on-surface-variant/30 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-surface-variant">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your exams, venues, or study tips..."
            className="w-full bg-surface-container-low border-none rounded-full py-4 pl-6 pr-14 text-label-md focus:ring-2 focus:ring-secondary transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
