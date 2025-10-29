import React from 'react';
import { SavedLesson } from '../types';

interface LessonViewerModalProps {
    lesson: SavedLesson | null;
    onClose: () => void;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

const getGoogleDriveEmbedUrl = (url: string): string | null => {
    const regExp = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    const fileId = match ? match[1] : null;
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

const LessonViewerModal: React.FC<LessonViewerModalProps> = ({ lesson, onClose }) => {
    if (!lesson) return null;

    let embedUrl: string | null = null;
    let error: string | null = null;

    if (lesson.url.includes('drive.google.com')) {
        embedUrl = getGoogleDriveEmbedUrl(lesson.url);
        if (!embedUrl) {
            error = "Invalid Google Drive URL provided.";
        }
    } else if (lesson.url.includes('youtube.com') || lesson.url.includes('youtu.be')) {
        embedUrl = getYouTubeEmbedUrl(lesson.url);
        if (!embedUrl) {
            error = "Invalid YouTube URL provided.";
        }
    } else {
        // Fallback for direct links (e.g., local PDFs from previous version)
        embedUrl = lesson.url;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-blue-800 truncate" title={lesson.title}>{lesson.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" aria-label="Close lesson viewer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="flex-grow w-full h-full">
                    {embedUrl && !error ? (
                        <iframe 
                            src={embedUrl} 
                            title={lesson.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full border-none"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
                            <p>{error || 'Could not display the content. Please check the link.'}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default LessonViewerModal;