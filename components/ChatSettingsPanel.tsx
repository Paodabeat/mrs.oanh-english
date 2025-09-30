import React from 'react';
import CharacterAvatar from './CharacterAvatar';

interface ChatSettingsPanelProps {
  botName: string;
  avatarUrl: string | null;
  title: string;
  savedWordsCount: number;
  onOpenSettings: () => void;
  onOpenDictionary: () => void;
  onEndConversation: () => void;
}

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const BookIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);


const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  botName,
  avatarUrl,
  title,
  savedWordsCount,
  onOpenSettings,
  onOpenDictionary,
  onEndConversation,
}) => {
  return (
    <div className="grid grid-cols-3 items-center p-4 bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm sticky top-0 z-10">
      <div className="justify-self-start">
        <CharacterAvatar name={botName} avatarUrl={avatarUrl} />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 truncate text-center" title={title}>
        {title}
      </h2>
      
      <div className="flex justify-end items-center space-x-2">
        <button
          onClick={onEndConversation}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          End Lesson
        </button>
         <button
          onClick={onOpenDictionary}
          className="relative p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Vocabulary"
        >
          <BookIcon />
          {savedWordsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {savedWordsCount}
            </span>
          )}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </div>
  );
};

export default ChatSettingsPanel;