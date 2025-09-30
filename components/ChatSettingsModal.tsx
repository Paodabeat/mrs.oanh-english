import React, { useState, useEffect } from 'react';
import { ConversationSetup, ProficiencyLevel } from '../types';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSetup: ConversationSetup;
  onSettingsChange: (newSettings: Partial<ConversationSetup>) => void;
  onNewTopicSubmit: () => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSetup,
  onSettingsChange,
  onNewTopicSubmit,
}) => {
  const [settings, setSettings] = useState(currentSetup);

  useEffect(() => {
    if (isOpen) {
      setSettings(currentSetup);
    }
  }, [isOpen, currentSetup]);


  const handleSettingsChange = (field: keyof ConversationSetup, value: string | ProficiencyLevel) => {
      setSettings(prev => ({...prev, [field]: value}));
  };
  
  const handleSave = () => {
      // Create an object with only the changed values
      const changes: Partial<ConversationSetup> = {};
      if (settings.title.trim() && settings.title !== currentSetup.title) {
          changes.title = settings.title.trim();
      }
      if (settings.vocab !== currentSetup.vocab) {
          changes.vocab = settings.vocab;
      }
      if (settings.level !== currentSetup.level) {
          changes.level = settings.level;
      }

      if (Object.keys(changes).length > 0) {
        onSettingsChange(changes);
      }
      onClose();
  };

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    onNewTopicSubmit();
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-transform duration-300 ease-in-out scale-100 animate-zoom-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center pb-3 border-b">
          <h2 className="text-xl font-bold text-blue-800" id="settings-modal-title">Chat Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="pt-4 space-y-6">
          {/* Change Title */}
          <div>
            <label htmlFor="conversationTitleModal" className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <div className="relative">
              <input
                type="text"
                id="conversationTitleModal"
                value={settings.title}
                onChange={(e) => handleSettingsChange('title', e.target.value)}
                className="w-full p-2 pr-8 border border-blue-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              {settings.title && (
                <button 
                  onClick={() => handleSettingsChange('title', '')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear title"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
           {/* Change Vocab */}
           <div>
              <label htmlFor="vocab" className="block text-sm font-medium text-gray-700 mb-1">
                Vocab and Sentences
              </label>
              <textarea
                id="vocab"
                value={settings.vocab}
                onChange={(e) => handleSettingsChange('vocab', e.target.value)}
                className="w-full p-2 border border-blue-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                rows={3}
              />
            </div>

          {/* Change Proficiency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proficiency Level
            </label>
            <div className="space-y-2">
                {(['beginner', 'intermediate', 'advanced'] as ProficiencyLevel[]).map(level => (
                    <button key={level} onClick={() => handleSettingsChange('level', level)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${settings.level === level ? 'bg-blue-100 border-blue-500 text-blue-800 font-semibold' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 space-y-4">
              <button
                onClick={handleSave}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>

             <form onSubmit={handleStartNewChat}>
              <p className="text-sm text-gray-600 mb-2">
                Start a new lesson with a different topic. This will end the current session.
              </p>
              <button
                type="submit"
                className="w-full mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Start New Lesson
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;