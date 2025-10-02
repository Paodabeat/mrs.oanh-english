import React, { useRef, useState } from 'react';
import { SavedConversation } from '../types';
import { teacherAvatar } from '../assets/avatar';
import { YOUTUBE_STUDY_LINKS, SOCIAL_LINKS } from '../constants';
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

// SVG Icons for Social Media
const FacebookIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>);
const YouTubeIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.25,4,12,4,12,4S5.75,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.75,2,12,2,12s0,4.25,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.75,20,12,20,12,20s6.25,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.25,22,12,22,12S22,7.75,21.582,6.186z M10,15.5v-7l6,3.5L10,15.5z" /></svg>);
const TikTokIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.94-2.16-4.54-1.72-6.95.31-1.62 1.15-3.19 2.4-4.25s2.9-1.62 4.54-1.68c.24-.01 1.29-.01 1.53-.01v4.39c-.45.01-.9.06-1.34.19-1.25.37-2.34 1.1-2.93 2.25-.66 1.29-.8 2.87-.41 4.25.41 1.48 1.51 2.65 2.95 2.97.1.02.2.04.3.05.61.12 1.25.12 1.86-.02 1.4-.33 2.51-1.28 3.1-2.6.43-.96.55-2.08.55-3.11V4.54c-.9.23-1.78.5-2.6.85-.3.12-.6.25-.9.37V.02z" /></svg>);
const LinkedInIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>);


const HomeScreen: React.FC<HomeScreenProps> = ({ 
    savedConversations, 
    onStartNew, 
    onView, 
    onDelete,
    onSaveData, 
    onUploadData 
}) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [youtubeLinksPage, setYoutubeLinksPage] = useState(1);
    const LINKS_PER_PAGE = 5;
    
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

    // Pagination logic for YouTube links
    const totalYoutubePages = Math.ceil(YOUTUBE_STUDY_LINKS.length / LINKS_PER_PAGE);
    const youtubeStartIndex = (youtubeLinksPage - 1) * LINKS_PER_PAGE;
    const currentYoutubeLinks = YOUTUBE_STUDY_LINKS.slice(youtubeStartIndex, youtubeStartIndex + LINKS_PER_PAGE);

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
                        <div>
                            {YOUTUBE_STUDY_LINKS.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p>No study links have been added yet.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {currentYoutubeLinks.map(link => {
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
                        {totalYoutubePages > 1 && (
                            <div className="flex justify-center items-center pt-4 mt-4 border-t border-gray-200">
                                <nav aria-label="YouTube Links Pagination" className="flex items-center gap-2">
                                    <button
                                        onClick={() => setYoutubeLinksPage(p => p - 1)}
                                        disabled={youtubeLinksPage === 1}
                                        className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    {Array.from({ length: totalYoutubePages }, (_, i) => i + 1).map(pageNumber => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setYoutubeLinksPage(pageNumber)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                                pageNumber === youtubeLinksPage 
                                                ? 'bg-blue-500 text-white cursor-default' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                            aria-current={pageNumber === youtubeLinksPage ? 'page' : undefined}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setYoutubeLinksPage(p => p + 1)}
                                        disabled={youtubeLinksPage === totalYoutubePages}
                                        className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
                 <footer className="text-center text-gray-500 text-sm mt-8 py-4 border-t border-gray-200">
                    <div className="flex justify-center items-center space-x-6 mb-4">
                        <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook">
                            <FacebookIcon />
                        </a>
                        <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600 transition-colors" aria-label="YouTube">
                            <YouTubeIcon />
                        </a>
                        <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors" aria-label="TikTok">
                            <TikTokIcon />
                        </a>
                        <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors" aria-label="LinkedIn">
                            <LinkedInIcon />
                        </a>
                    </div>
                    <p className="text-xs text-gray-400">An EdTech Product of Paodabeat</p>
                </footer>
            </div>
        </>
    );
};

export default HomeScreen;