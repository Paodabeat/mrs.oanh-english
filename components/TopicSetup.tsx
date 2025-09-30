
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ConversationSetup, ProficiencyLevel } from '../types';

interface TopicSetupProps {
  onSubmit: (setupData: ConversationSetup) => void;
  onCancel: () => void;
  initialError?: string | null;
}

const AvatarPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400 p-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = () => (
     <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const TopicSetup: React.FC<TopicSetupProps> = ({ onSubmit, onCancel, initialError }) => {
  const [title, setTitle] = useState('');
  const [vocab, setVocab] = useState('');
  const [level, setLevel] = useState<ProficiencyLevel>('intermediate');
  const [error, setError] = useState<string | null>(initialError || null);

  const [avatarPrompt, setAvatarPrompt] = useState('A Vietnamese female English teacher with long black hair, wearing a pink Ao Dai, wearing glasses');
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewUrl = uploadedAvatarUrl || generatedAvatarUrl;


  const handleGenerateAvatar = async () => {
    if (!process.env.API_KEY) {
        setAvatarError('API Key is not configured.');
        return;
    }
    if (!avatarPrompt.trim()) {
        setAvatarError('Please enter a description for the avatar.');
        return;
    }
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    setUploadedAvatarUrl(null); // Clear uploaded avatar
    setGeneratedAvatarUrl(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: avatarPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        setGeneratedAvatarUrl(imageUrl);
    } catch (e: any) {
        console.error("Error generating avatar:", e);
        setAvatarError(`Failed to generate avatar. Error: ${e.message}`);
    } finally {
        setIsGeneratingAvatar(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setUploadedAvatarUrl(result);
            setGeneratedAvatarUrl(null); // Clear AI avatar
            setAvatarError(null);
        };
        reader.readAsDataURL(file);
    } else {
        setAvatarError('Please select a valid image file (PNG, JPG, etc.).');
    }
    // Reset file input value to allow re-uploading the same file
    e.target.value = '';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vocab.trim()) {
      setError('Please fill in all fields to start your lesson.');
      return;
    }
    setError(null);
    onSubmit({ title, vocab, level, avatarUrl: uploadedAvatarUrl || generatedAvatarUrl || undefined });
  };
  
  const proficiencyOptions: { id: ProficiencyLevel; label: string; description: string }[] = [
      { id: 'beginner', label: 'Sơ cấp (Beginner)', description: 'Làm quen, sử dụng các từ và câu cơ bản.' },
      { id: 'intermediate', label: 'Trung cấp (Intermediate)', description: 'Mở rộng từ vựng, phát triển hội thoại.' },
      { id: 'advanced', label: 'Nâng cao (Advanced)', description: 'Thảo luận chuyên sâu, ngôn ngữ tự nhiên.' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Welcome to Mrs. Oanh English!</h2>
        <p className="text-gray-600 mb-6">Let's set up your practice session for today.</p>
        <form onSubmit={handleSubmit} className="w-full text-left space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-blue-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                placeholder="e.g., Ordering coffee"
              />
            </div>
            <div>
              <label htmlFor="vocab" className="block text-sm font-medium text-gray-700 mb-1">
                Words or sentences
              </label>
              <textarea
                id="vocab"
                value={vocab}
                onChange={(e) => setVocab(e.target.value)}
                className="w-full p-3 border border-blue-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200 resize-none"
                rows={3}
                placeholder="e.g., I'd like a latte, How much is it?"
              />
            </div>

            {/* Avatar Generation & Upload */}
            <div className="border-t pt-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                Create or Upload an Avatar (Optional)
              </label>
              <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed flex-shrink-0">
                      {isGeneratingAvatar ? <LoadingSpinner /> : avatarPreviewUrl ? <img src={avatarPreviewUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-md" /> : <AvatarPlaceholder />}
                  </div>
                  <div className="flex-grow">
                      <textarea
                        value={avatarPrompt}
                        onChange={(e) => setAvatarPrompt(e.target.value)}
                        className="w-full p-2 border border-blue-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200 resize-none"
                        rows={2}
                        placeholder="Describe an avatar to generate..."
                      />
                      <div className="flex gap-2 mt-2">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/*"
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                            Upload
                        </button>
                        <button type="button" onClick={handleGenerateAvatar} disabled={isGeneratingAvatar} className="w-full bg-indigo-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                            {isGeneratingAvatar ? '...' : 'Generate'}
                        </button>
                      </div>
                  </div>
              </div>
               {avatarError && <p className="text-red-500 text-xs mt-1">{avatarError}</p>}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trình độ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {proficiencyOptions.map(option => (
                      <button key={option.id} type="button" onClick={() => setLevel(option.id)} className={`text-left p-3 rounded-lg border-2 text-center transition-colors ${level === option.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                          <span className={`block text-sm font-semibold ${level === option.id ? 'text-blue-800' : 'text-gray-800'}`}>{option.label}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                      </button>
                  ))}
              </div>
            </div>
          
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          
            <div className="mt-4">
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    Start Practicing
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full mt-2 bg-transparent text-gray-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    Cancel
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TopicSetup;
