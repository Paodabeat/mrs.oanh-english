
import React from 'react';

interface MicButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
}

const MicIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
  </svg>
);

const MicButton: React.FC<MicButtonProps> = ({ isListening, isSpeaking, isLoading, onClick, disabled }) => {
  let buttonClass = 'bg-blue-500 hover:bg-blue-600';
  let pulseClass = '';

  if (isListening) {
    buttonClass = 'bg-red-500 hover:bg-red-600';
    pulseClass = 'animate-pulse';
  } else if (isSpeaking || isLoading) {
    buttonClass = 'bg-gray-400 cursor-not-allowed';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-300 ${buttonClass} ${disabled ? '' : 'hover:scale-110'}`}
    >
      {isListening && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
      )}
      <MicIcon />
    </button>
  );
};

export default MicButton;