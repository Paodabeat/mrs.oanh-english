import React, { useState, useEffect } from 'react';
import { SavedWord } from '../types';

interface FlashcardScreenProps {
    words: SavedWord[];
    onBack: () => void;
    onUpdateWord: (updatedWord: SavedWord) => void;
}

const EditWordModal: React.FC<{ word: SavedWord; onSave: (updatedWord: SavedWord) => void; onClose: () => void }> = ({ word, onSave, onClose }) => {
    const [formData, setFormData] = useState<SavedWord>(word);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-zoom-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-blue-800 mb-4">Edit '{word.original}'</h3>
                <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {Object.keys(formData).map(key => (
                         <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">{key.replace('_', ' ')}</label>
                            <textarea
                                id={key}
                                name={key}
                                value={(formData as any)[key] || ''}
                                onChange={handleChange}
                                disabled={key === 'original'}
                                className={`w-full p-2 mt-1 border border-blue-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${key === 'original' ? 'bg-gray-100' : ''}`}
                                rows={key === 'definition' || key === 'example' ? 3 : 1}
                            />
                        </div>
                    ))}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ words, onBack, onUpdateWord }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Reset flip state when card changes
        setIsFlipped(false);
    }, [currentIndex]);

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h2 className="text-2xl font-bold text-blue-800 mb-2">No words to study!</h2>
                <p className="text-gray-600 mb-6">Save some words from the dictionary to start learning with flashcards.</p>
                <button onClick={onBack} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
                    Back to Chat
                </button>
            </div>
        );
    }
    
    const currentWord = words[currentIndex];

    const goToNext = () => {
        setCurrentIndex(prev => (prev + 1) % words.length);
    };

    const goToPrev = () => {
        setCurrentIndex(prev => (prev - 1 + words.length) % words.length);
    };
    
    const handleSaveEdit = (updatedWord: SavedWord) => {
        onUpdateWord(updatedWord);
        setIsEditing(false);
    }

    return (
        <div className="flex flex-col h-full bg-blue-100 p-4 sm:p-6 lg:p-8">
            {isEditing && <EditWordModal word={currentWord} onSave={handleSaveEdit} onClose={() => setIsEditing(false)} />}
            
            <header className="flex-shrink-0 flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-gray-50">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-blue-900">Study Flashcards</h1>
                <div className="w-28 text-right"> {/* Placeholder for alignment */}
                     <p className="text-gray-600 font-semibold">{currentIndex + 1} / {words.length}</p>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center">
                {/* Flashcard */}
                <div className="w-full max-w-xl h-80 perspective-1000">
                    <div 
                        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl flex items-center justify-center cursor-pointer border-4 border-blue-200">
                            <h2 className="text-5xl font-bold text-blue-900">{currentWord.original}</h2>
                        </div>
                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl p-6 overflow-y-auto rotate-y-180 border-4 border-green-200">
                             <div className="space-y-3 text-left">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-green-800">{currentWord.original}</h3>
                                        <p className="text-gray-500 font-mono">/{currentWord.ipa}/</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Edit</button>
                                </div>
                                <p><strong className="font-semibold text-gray-700">Tiếng Việt:</strong> {currentWord.translation}</p>
                                <p><strong className="font-semibold text-gray-700">Definition:</strong> {currentWord.definition}</p>
                                <p><strong className="font-semibold text-gray-700">Example:</strong> <em className="text-gray-600">"{currentWord.example}"</em></p>
                                {currentWord.notes && <p><strong className="font-semibold text-gray-700">Notes:</strong> {currentWord.notes}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-500 mt-4">Click card to flip.</p>

                {/* Navigation */}
                <div className="flex items-center justify-between w-full max-w-xl mt-6">
                    <button onClick={goToPrev} className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-md hover:bg-gray-50 transition-transform transform hover:scale-105">
                        Previous
                    </button>
                    <button onClick={goToNext} className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-md hover:bg-gray-50 transition-transform transform hover:scale-105">
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FlashcardScreen;