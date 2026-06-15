import React from 'react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content }) => {
  const isAI = role === 'assistant';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] p-4 rounded-2xl ${
          isAI
            ? 'bg-white border border-outline-variant text-primary rounded-tl-sm shadow-sm'
            : 'bg-primary-container text-white rounded-tr-sm shadow-md'
        }`}
      >
        <p className="text-body-md leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
