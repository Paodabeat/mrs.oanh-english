import React from 'react';
import { Message, MessageSender } from '../types';

interface ChatBubbleProps {
  message: Message;
  isLoading?: boolean;
  avatarUrl?: string | null;
}

const LoadingDots: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
    </div>
);


const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLoading = false, avatarUrl }) => {
  const isAI = message.sender === MessageSender.AI;

  const bubbleClasses = isAI
    ? 'bg-blue-500 text-white rounded-br-none'
    : 'bg-gray-200 text-gray-800 rounded-bl-none';

  const containerClasses = isAI ? 'justify-start' : 'justify-end';

  return (
    <div className={`flex ${containerClasses} animate-fade-in-up`}>
      <div className="flex items-end max-w-xs md:max-w-md">
        {isAI && avatarUrl && (
            <img 
              src={avatarUrl} 
              alt="AI Avatar" 
              className="w-8 h-8 mr-2 rounded-full object-cover flex-shrink-0 border border-blue-100"
            />
        )}
        <div className={`px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
          {isLoading ? <LoadingDots /> : <p className="text-base">{message.text}</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;