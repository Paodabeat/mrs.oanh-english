import React from 'react';

interface CharacterAvatarProps {
  name: string;
  avatarUrl: string | null;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ name, avatarUrl }) => {
  return (
    <div className="flex items-center space-x-4">
      {avatarUrl ? (
        <img 
          src={avatarUrl}
          alt={`Avatar of ${name}`}
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow-md"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-blue-900">{name}</h1>
        <p className="text-sm text-gray-500">Your friendly English teacher</p>
      </div>
    </div>
  );
};

export default CharacterAvatar;