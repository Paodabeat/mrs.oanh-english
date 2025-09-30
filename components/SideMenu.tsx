
import React, { useState, useEffect } from 'react';
import { ProficiencyLevel } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentBotName: string;
  onBotNameChange: (name: string) => void;
  currentProficiency: ProficiencyLevel;
  onProficiencyChange: (level: ProficiencyLevel) => void;
  onNewTopicSubmit: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  currentBotName,
  onBotNameChange,
  currentProficiency,
  onProficiencyChange,
  onNewTopicSubmit,
}) => {
  const [botName, setBotName] = useState(currentBotName);
  const [proficiency, setProficiency] = useState<ProficiencyLevel>(currentProficiency);

  useEffect(() => {
    setBotName(currentBotName);
  }, [currentBotName]);

  useEffect(() => {
    setProficiency(currentProficiency);
  }, [currentProficiency]);


  const handleNameSave = () => {
    if (botName.trim()) {
      onBotNameChange(botName.trim());
    }
  };
  
  const handleProficiencySave = (level: ProficiencyLevel) => {
    setProficiency(level);
    onProficiencyChange(level);
  }

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    // This will trigger the App to go back to the TopicSetup screen
    onNewTopicSubmit();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      {/* Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-blue-800">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Change Name */}
          <div>
            <label htmlFor="botName" className="block text-sm font-medium text-gray-700 mb-1">
              Chatbot Name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="botName"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <button
                onClick={handleNameSave}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </div>
          
          {/* Change Proficiency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proficiency Level
            </label>
            <div className="space-y-2">
                {(['beginner', 'intermediate', 'advanced'] as ProficiencyLevel[]).map(level => (
                    <button key={level} onClick={() => handleProficiencySave(level)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${proficiency === level ? 'bg-blue-100 border-blue-500 text-blue-800 font-semibold' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                    </button>
                ))}
            </div>
          </div>


          {/* New Topic */}
          <div className="border-t pt-6">
             <form onSubmit={handleStartNewChat}>
              <p className="text-sm text-gray-600 mb-2">
                Start a new lesson with a different topic and vocabulary.
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
    </>
  );
};

export default SideMenu;
