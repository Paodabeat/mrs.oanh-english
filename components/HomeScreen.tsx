import React, { useRef } from 'react';
import { SavedConversation } from '../types';
import { teacherAvatar } from '../assets/avatar';
import { YOUTUBE_STUDY_LINKS } from '../constants';
import mrsOanhAvatar from '../assets/mrsoanh-avarta.jpg';

const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

interface HomeScreenProps {
  savedConversations: SavedConversation[];
  onStartNew: () => void;
  onView: (conversation: SavedConversation) => void;
  onDelete: (conversationId: string) => void;
  onSaveData: () => void;
  onUploadData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
    savedConversations, 
    onStartNew, 
    onView, 
    onDelete,
    onSaveData, 
    onUploadData 
}) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return (
        <>
            <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8">
                    <img src={mrsOanhAvatar} alt="Mrs.Oanh" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-contain p-2" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">MRS.OANH ENGLISH</h1>
                    <p className="text-gray-600 mt-2">Your AI-powered English practice partner.</p>
                </header>

                <div className="flex-grow w-full max-w-2xl mx-auto space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Conversation History</h2>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onUploadData}
                                    className="hidden"
                                    accept="application/json"
                                />
                                <button 
                                    onClick={handleUploadClick}
                                    className="bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"
                                >
                                    Upload
                                </button>
                                 <button 
                                    onClick={onSaveData}
                                    className="bg-indigo-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={onStartNew}
                                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                                >
                                    Start New Lesson
                                </button>
                            </div>
                        </div>
                        
                        <div className="max-h-[50vh] overflow-y-auto pr-2">
                            {savedConversations.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p>No saved conversations yet.</p>
                                    <p>Start a new lesson to begin practicing!</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {savedConversations.map(convo => (
                                        <li key={convo.id} className="relative group">
                                            <button 
                                                onClick={() => onView(convo)}
                                                className="w-full flex items-center text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                            >
                                                <img 
                                                    src={convo.setup.avatarUrl || teacherAvatar} 
                                                    alt={convo.setup.title}
                                                    className="w-12 h-12 rounded-full object-cover mr-4 flex-shrink-0 border-2 border-white shadow-sm"
                                                />
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-blue-800 truncate">{convo.setup.title}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(convo.timestamp)}</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(convo.id);
                                                }}
                                                title="Delete conversation"
                                                className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            >
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
                        <div className="flex justify-between items-center gap-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">YouTube Study Links</h2>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto pr-2">
                            {YOUTUBE_STUDY_LINKS.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p>No study links have been added yet.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {YOUTUBE_STUDY_LINKS.map(link => {
                                        const videoId = getYouTubeVideoId(link.url);
                                        return (
                                            <li key={link.id} className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200 justify-between">
                                                <div className="flex items-center flex-grow gap-4 overflow-hidden">
                                                    {videoId ? (
                                                        <img src={`https://img.youtube.com/vi/${videoId}/default.jpg`} alt={link.title} className="w-20 h-14 rounded-md object-cover flex-shrink-0 border border-gray-200" />
                                                    ) : (
                                                        <div className="w-20 h-14 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </div>
                                                    )}
                                                    <p className="font-semibold text-blue-800 truncate" title={link.title}>{link.title}</p>
                                                </div>
                                                <button 
                                                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                                                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm flex-shrink-0 ml-4"
                                                >
                                                    Watch
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                 <footer className="text-center text-gray-400 text-xs mt-4">
                    <p>Select a past conversation to review, or start a new one.</p>
                </footer>
            </div>
        </>
    );
};

export default HomeScreen;