import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SavedWord } from '../types';

interface DictionaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWord: string | null;
  savedWords: SavedWord[];
  onSaveWord: (word: SavedWord) => void;
  onDeleteWord: (word: string) => void;
  onStudy: () => void;
}

// Interface for the detailed dictionary data from the API
interface DictionaryResult extends SavedWord {}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full p-8">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const PronunciationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 4a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zM6 8a2 2 0 114 0v4a2 2 0 11-4 0V8z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.564-2.58 1 1 0 011.558 1.265 4.012 4.012 0 00-1.23 1.75 1 1 0 11-1.892-.535zM14.224 9.42a4.012 4.012 0 00-1.23-1.75 1 1 0 111.558-1.265 6.012 6.012 0 011.564 2.58 1 1 0 01-1.892.535z" clipRule="evenodd" />
    </svg>
);


const DictionaryPanel: React.FC<DictionaryPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedWord,
  savedWords,
  onSaveWord,
  onDeleteWord,
  onStudy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dictionary' | 'saved'>('dictionary');
  
  const isWordSaved = result ? savedWords.some(w => w.original.toLowerCase() === result.original.toLowerCase()) : false;

  useEffect(() => {
    if (selectedWord) {
      setSearchTerm(selectedWord);
      setActiveTab('dictionary');
      handleSearch(selectedWord);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord]);
  
  useEffect(() => {
    if (!isOpen) {
        // Reset state when panel is closed
        setSearchTerm('');
        setResult(null);
        setError(null);
        setIsLoading(false);
    }
  }, [isOpen]);

  const playPronunciation = (text: string) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis API is not supported.");
      alert("Sorry, your browser doesn't support audio pronunciation.");
      return;
    }
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Ensure it uses an English voice
    window.speechSynthesis.speak(utterance);
  };

  const handleSearch = async (wordToSearch: string) => {
    const term = wordToSearch.trim().toLowerCase();
    if (!term) return;

    if (!process.env.API_KEY) {
        setError('API Key is not configured.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const schema = {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            translation: { type: Type.STRING },
            ipa: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING },
          },
          required: ['original', 'translation', 'ipa', 'definition', 'example']
        };

        const prompt = `Provide a detailed dictionary entry for the English word "${term}". Include its Vietnamese translation, IPA pronunciation, a simple English definition, and an example sentence. The word itself should be in the "original" field.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResult: DictionaryResult = JSON.parse(jsonText);
        setResult(parsedResult);

    } catch (e: any) {
        console.error("Error fetching dictionary data:", e);
        setError("Could not find the word or an error occurred. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleSaveCurrentWord = () => {
    if (result) {
        onSaveWord(result);
    }
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
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <header className="flex-shrink-0 p-4 border-b">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-800">Vocabulary</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
          </div>
           <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab('dictionary')} 
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'dictionary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    Dictionary
                </button>
                <button 
                    onClick={() => setActiveTab('saved')} 
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'saved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    Saved Words ({savedWords.length})
                </button>
            </div>
        </header>

        <main className="flex-grow overflow-y-auto">
            {activeTab === 'dictionary' && (
                <div className="p-4">
                    <form onSubmit={handleFormSubmit}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for a word..."
                                className="w-full p-3 pl-10 border border-blue-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </form>
                    
                    <div className="mt-4">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-center text-red-500">{error}</p>}
                        {result && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3 animate-fade-in">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold text-blue-900">{result.original}</h3>
                                        <button onClick={() => playPronunciation(result.original)} title={`Pronounce ${result.original}`} className="p-2 text-blue-600 rounded-full hover:bg-blue-200">
                                            <PronunciationIcon />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 font-mono">/{result.ipa}/</p>
                                </div>
                                <p className="text-lg"><strong className="font-semibold text-gray-700">Tiếng Việt:</strong> {result.translation}</p>
                                <div>
                                    <p className="font-semibold text-gray-700">Definition:</p>
                                    <p>{result.definition}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">Example:</p>
                                    <p className="italic text-gray-600">"{result.example}"</p>
                                </div>

                                <button 
                                    onClick={handleSaveCurrentWord}
                                    disabled={isWordSaved}
                                    className="w-full mt-2 py-2 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isWordSaved ? 'Word Saved' : 'Save Word'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'saved' && (
                <div className="p-4">
                    {savedWords.length > 0 && (
                        <div className="mb-4">
                            <button
                                onClick={onStudy}
                                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                            >
                                Study Flashcards
                            </button>
                        </div>
                    )}
                    {savedWords.length === 0 ? (
                         <p className="text-center text-gray-500 mt-8">You haven't saved any words yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {savedWords.map(word => (
                                <li key={word.original} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{word.original}</p>
                                        <p className="text-sm text-gray-600">{word.translation}</p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button onClick={() => playPronunciation(word.original)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title={`Pronounce ${word.original}`}>
                                            <PronunciationIcon />
                                        </button>
                                        <button onClick={() => onDeleteWord(word.original)} className="p-2 text-red-500 rounded-full hover:bg-red-100" title={`Delete ${word.original}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </main>
      </div>
    </>
  );
};

export default DictionaryPanel;