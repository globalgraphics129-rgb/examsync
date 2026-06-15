import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const GlobalAIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your ExamSync AI. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onend = () => setIsListening(false);
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      } else {
        alert("Your browser does not support Voice Recognition. Please use Chrome or Edge.");
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || !user) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        messages: [...messages, userMessage],
        context: {
          name: user.name,
          university: user.uniId,
          faculty: user.faculty,
          department: user.department,
          semester: user.semester,
          courses: user.courses,
          grades: user.grades,
          googleLinked: user.googleCalendarLinked,
          googleAccessToken: user.googleAccessToken
        }
      });

      const aiResponse = response.data.reply;
      const assistantMessage: Message = { id: Date.now().toString() + 1, role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
      
      // If voice is active or user just spoke, we can auto-speak the response
      // For now, let's always speak it if the user was using voice
      speakText(aiResponse);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`bg-surface-card border border-primary/30 rounded-2xl shadow-card overflow-hidden flex flex-col transition-all duration-300 mb-4 origin-bottom-right ${isExpanded ? 'w-[400px] h-[600px] sm:w-[500px] sm:h-[700px]' : 'w-[350px] h-[500px]'}`}
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-on-primary font-bold">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-on-surface font-bold tracking-tight leading-none">ExamSync AI</h3>
                  <p className="text-primary text-[10px] uppercase tracking-widest font-bold mt-1">Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{isExpanded ? 'close_fullscreen' : 'open_in_full'}</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container text-on-surface rounded-bl-sm border border-outline/10'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container border border-outline/10 rounded-2xl rounded-bl-sm px-4 py-4 flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface-container border-t border-outline/5">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-2">
                <button 
                  type="button" 
                  onClick={toggleListen}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isListening ? 'bg-error text-on-error shadow-md animate-pulse' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
                >
                  <span className="material-symbols-outlined">{isListening ? 'mic' : 'mic_none'}</span>
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isListening ? 'Listening...' : 'Message ExamSync AI...'}
                  className="flex-1 bg-surface-container-high border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0 shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-[9999]"
      >
        <span className="material-symbols-outlined text-3xl">{isOpen ? 'close' : 'temp_preferences_custom'}</span>
      </motion.button>
    </div>
  );
};

export default GlobalAIAssistant;
