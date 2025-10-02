import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import useSpeech from './hooks/useSpeech';
import { Message, MessageSender, ConversationSetup, SavedWord, SavedConversation, ProficiencyLevel } from './types';
import { BASE_SYSTEM_INSTRUCTION, PROFICIENCY_LEVELS } from './constants';
import { teacherAvatar } from './assets/avatar';

import HomeScreen from './components/HomeScreen';
import TopicSetup from './components/TopicSetup';
import ChatSettingsPanel from './components/ChatSettingsPanel';
import ChatBubble from './components/ChatBubble';
import MicButton from './components/MicButton';
import ChatSettingsModal from './components/ChatSettingsModal';
import DictionaryPanel from './components/DictionaryPanel';
import FlashcardScreen from './components/FlashcardScreen';

type Screen = 'home' | 'setup' | 'chat' | 'flashcards';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);


const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('home');
    const [currentConversation, setCurrentConversation] = useState<SavedConversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);

    // Side Panels State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    // Data State
    const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
    const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
    const [isStorageFull, setIsStorageFull] = useState(false); // For savedWords in localStorage
    
    const { isListening, isSpeaking, transcript, speak, startListening, stopListening } = useSpeech();
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Effects ---
    
    // Check for API Key on mount
    useEffect(() => {
        if (!process.env.API_KEY) {
            setApiError("API Key is not configured. Please set the API_KEY environment variable.");
        }
    }, []);

    // Load conversations from local storage on mount
    useEffect(() => {
        try {
            const storedConversations = localStorage.getItem('savedConversations');
            if (storedConversations) {
                const conversations: SavedConversation[] = JSON.parse(storedConversations);
                setSavedConversations(conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }
        } catch (error) {
            console.error("Failed to load conversations from local storage:", error);
        }
    }, []);

    // Save conversations to local storage when they change
    useEffect(() => {
        try {
            localStorage.setItem('savedConversations', JSON.stringify(savedConversations));
        } catch (error) {
            console.error("Failed to save conversations to local storage:", error);
        }
    }, [savedConversations]);

    // Load saved words from local storage on mount
    useEffect(() => {
        try {
            const storedWords = localStorage.getItem('savedWords');
            if (storedWords) setSavedWords(JSON.parse(storedWords));
        } catch (error) {
            console.error("Failed to load words from local storage:", error);
        }
    }, []);
    
    // Save words to local storage when they change
    useEffect(() => {
        try {
            localStorage.setItem('savedWords', JSON.stringify(savedWords));
        } catch (error: any) {
            const isQuotaError = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22);
            if (isQuotaError) {
                if (!isStorageFull) {
                    console.error("Failed to save words to local storage:", error);
                    setIsStorageFull(true);
                }
            } else {
                console.error("An unexpected error occurred while saving words:", error);
            }
        }
    }, [savedWords, isStorageFull]);
    
    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle speech recognition result
    useEffect(() => {
        if (transcript) {
            handleSendMessage(transcript);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript]);


    // --- Core Chat Logic ---

    const startNewConversation = (setupData: ConversationSetup) => {
        const conversationId = generateId();
        const newConversation: SavedConversation = {
            id: conversationId,
            setup: { ...setupData, avatarUrl: setupData.avatarUrl || teacherAvatar },
            messages: [],
            timestamp: new Date().toISOString(),
            botName: "Mrs. Oanh"
        };
        
        setCurrentConversation(newConversation);
        setMessages([]);
        setScreen('chat');
        
        initializeChat(newConversation.setup);
    };

    const initializeChat = async (setup: ConversationSetup) => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const proficiencyInstruction = PROFICIENCY_LEVELS[setup.level];
            const systemInstruction = `${BASE_SYSTEM_INSTRUCTION.replace('{botName}', "Mrs. Oanh")} You are having a conversation about "${setup.title}". The user wants to practice these words/phrases: "${setup.vocab}". ${proficiencyInstruction}`;

            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            
            if (messages.length === 0) {
                const firstMessage = `Hi! I'm Mrs. Oanh. Today, we're going to talk about "${setup.title}". Let's start! How are you doing?`;
                const aiMessage: Message = { id: generateId(), text: firstMessage, sender: MessageSender.AI };
                
                setMessages([aiMessage]);
                speak(firstMessage);
            }

        } catch (error) {
            console.error("Error initializing chat:", error);
            setApiError("Failed to initialize the conversation. Please check your API Key and network connection.");
            setScreen('setup');
        } finally {
            setIsLoading(false);
        }
    };
    
    const resumeConversation = async (conversation: SavedConversation) => {
        setIsLoading(true);
        setScreen('chat');
        setCurrentConversation(conversation);
        setMessages(conversation.messages);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const { setup, messages: historyMessages } = conversation;
            const proficiencyInstruction = PROFICIENCY_LEVELS[setup.level];
            const systemInstruction = `${BASE_SYSTEM_INSTRUCTION.replace('{botName}', "Mrs. Oanh")} You are having a conversation about "${setup.title}". The user wants to practice these words/phrases: "${setup.vocab}". ${proficiencyInstruction}`;

            const history: Content[] = historyMessages.map(msg => ({
                role: msg.sender === MessageSender.User ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history: history
            });
            
            const welcomeMessageText = `Welcome back to our lesson on "${setup.title}"! Let's continue where we left off.`;
            const welcomeMessage: Message = { id: generateId(), text: welcomeMessageText, sender: MessageSender.AI };
            
            setTimeout(() => {
                setMessages(prev => [...prev, welcomeMessage]);
                speak(welcomeMessageText);
            }, 500);

        } catch (error) {
            console.error("Error resuming chat:", error);
            setApiError("Failed to resume the conversation. Please check your API Key and network connection.");
            setScreen('home'); 
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !chatRef.current || isLoading) return;

        const userMessage: Message = { id: generateId(), text, sender: MessageSender.User };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: text });
            const aiText = response.text;
            
            const aiMessage: Message = { id: generateId(), text: aiText, sender: MessageSender.AI };
            setMessages(prev => [...prev, aiMessage]);
            speak(aiText);

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { id: generateId(), text: "Sorry, I encountered an error. Please try again.", sender: MessageSender.AI };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const endConversation = () => {
        if (currentConversation) {
             const finalConversation = { ...currentConversation, messages, timestamp: new Date().toISOString() };
             const exists = savedConversations.some(c => c.id === finalConversation.id);
             
             let updatedConversations;
             if (exists) {
                 updatedConversations = savedConversations.map(c => c.id === finalConversation.id ? finalConversation : c);
             } else {
                 updatedConversations = [finalConversation, ...savedConversations];
             }
             setSavedConversations(updatedConversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
        
        setCurrentConversation(null);
        setMessages([]);
        chatRef.current = null;
        setScreen('home');
    };

    // --- UI Handlers ---

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };
    
    const handleWordSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const selectedText = selection.toString().trim();
            if (selectedText.length < 30 && !selectedText.includes(' ')) {
                setSelectedWord(selectedText);
                setIsDictionaryOpen(true);
            }
        }
    };
    
    const handleSaveWord = (word: SavedWord) => {
        if (!savedWords.some(w => w.original.toLowerCase() === word.original.toLowerCase())) {
            setSavedWords(prev => [word, ...prev]);
        }
    };
    const handleDeleteWord = (originalWord: string) => {
        setSavedWords(prev => prev.filter(w => w.original !== originalWord));
    };
    const handleUpdateWord = (updatedWord: SavedWord) => {
        setSavedWords(prev => prev.map(w => w.original.toLowerCase() === updatedWord.original.toLowerCase() ? updatedWord : w));
    };

    const handleViewConversation = (conversation: SavedConversation) => {
        resumeConversation(conversation);
    };

    const handleDeleteConversation = (id: string) => {
        setSavedConversations(prev => prev.filter(c => c.id !== id));
    };
    
    const handleStartNewFromHome = () => setScreen('setup');

    // --- Settings Handlers ---
    
    const updateChatConfig = (newSetup: ConversationSetup) => {
        if (!process.env.API_KEY) {
            setApiError("API Key is not configured.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const proficiencyInstruction = PROFICIENCY_LEVELS[newSetup.level];
            const systemInstruction = `${BASE_SYSTEM_INSTRUCTION.replace('{botName}', 'Mrs. Oanh')} You are having a conversation about "${newSetup.title}". The user wants to practice these words/phrases: "${newSetup.vocab}". ${proficiencyInstruction}`;

            const history: Content[] = messages.map(msg => ({
                role: msg.sender === MessageSender.User ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history: history
            });

        } catch (error) {
            console.error("Error updating chat config:", error);
            setApiError("Failed to update the conversation settings.");
        }
    };
    
    const handleSettingsChange = (newSettings: Partial<ConversationSetup>) => {
        if (currentConversation) {
            const updatedSetup = { ...currentConversation.setup, ...newSettings };
            
            if (newSettings.title) {
                updatedSetup.title = newSettings.title.trim();
                if (!updatedSetup.title) return;
            }
            
            const updatedConversation = { ...currentConversation, setup: updatedSetup };
            setCurrentConversation(updatedConversation);
            
            // Persist settings change immediately to local storage
            const updatedConversations = savedConversations.map(c => c.id === updatedConversation.id ? updatedConversation : c);
            setSavedConversations(updatedConversations);
            
            updateChatConfig(updatedSetup);
        }
    };
    
    const handleStudyWords = () => {
        setIsDictionaryOpen(false);
        setScreen('flashcards');
    };

    // --- Data Handlers (for local backup) ---

    const handleSaveData = () => {
        try {
            const dataToSave = {
                savedConversations,
                savedWords,
            };
            const jsonString = JSON.stringify(dataToSave, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mrs-oanh-english-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to save data:", error);
            alert("An error occurred while trying to save your data.");
        }
    };

    const handleUploadData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File could not be read as text.");
            }
            const data = JSON.parse(text);

            if (Array.isArray(data.savedConversations) && Array.isArray(data.savedWords)) {
                setSavedConversations(data.savedConversations);
                setSavedWords(data.savedWords);
                alert("Data uploaded successfully!");
            } else {
                throw new Error("Invalid data format in the JSON file.");
            }
        } catch (error: any) {
            console.error("Failed to upload data:", error);
            alert(`An error occurred while uploading the file: ${error.message}`);
        } finally {
            if(event.target) event.target.value = '';
        }
        };
        reader.readAsText(file);
    };


    // --- Render Logic ---

    const renderScreen = () => {
        switch (screen) {
            case 'home':
                return <HomeScreen 
                    savedConversations={savedConversations}
                    onStartNew={handleStartNewFromHome}
                    onView={handleViewConversation}
                    onDelete={handleDeleteConversation}
                    onSaveData={handleSaveData}
                    onUploadData={handleUploadData}
                />;
            case 'setup':
                return <TopicSetup 
                    onSubmit={startNewConversation} 
                    onCancel={() => setScreen('home')}
                    initialError={apiError} 
                />;
            case 'flashcards':
                return <FlashcardScreen 
                    words={savedWords}
                    onBack={() => setScreen('chat')}
                    onUpdateWord={handleUpdateWord}
                />;
            case 'chat':
                if (!currentConversation) {
                    useEffect(() => setScreen('home'), []);
                    return null;
                }
                return (
                    <div className="flex flex-col h-full bg-gray-50">
                        <ChatSettingsPanel
                            botName={currentConversation.botName}
                            title={currentConversation.setup.title}
                            avatarUrl={currentConversation.setup.avatarUrl || null}
                            savedWordsCount={savedWords.length}
                            onOpenSettings={() => setIsSettingsModalOpen(true)}
                            onOpenDictionary={() => setIsDictionaryOpen(true)}
                            onEndConversation={endConversation}
                        />
                        <main className="flex-1 overflow-y-auto p-4 space-y-4" onMouseUp={handleWordSelection}>
                            {messages.map((msg) => (
                                <ChatBubble
                                    key={msg.id}
                                    message={msg}
                                    avatarUrl={currentConversation.setup.avatarUrl || null}
                                />
                            ))}
                            {isLoading && messages[messages.length - 1]?.sender === MessageSender.User && (
                                <ChatBubble
                                    message={{ id: 'loading', text: '', sender: MessageSender.AI }}
                                    isLoading={true}
                                    avatarUrl={currentConversation.setup.avatarUrl || null}
                                />
                            )}
                            <div ref={messagesEndRef} />
                        </main>
                        <footer className="flex justify-center items-center p-4 bg-white border-t">
                            <MicButton 
                                isListening={isListening}
                                isSpeaking={isSpeaking}
                                isLoading={isLoading}
                                onClick={handleMicClick}
                                disabled={isSpeaking || isLoading || !chatRef.current}
                            />
                        </footer>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen w-screen font-sans">
            {renderScreen()}
            {screen === 'chat' && currentConversation && (
                <>
                    <ChatSettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        currentSetup={currentConversation.setup}
                        onSettingsChange={handleSettingsChange}
                        onNewTopicSubmit={() => {
                            setIsSettingsModalOpen(false);
                            endConversation();
                            setScreen('setup');
                        }}
                    />
                    <DictionaryPanel
                        isOpen={isDictionaryOpen}
                        onClose={() => setIsDictionaryOpen(false)}
                        selectedWord={selectedWord}
                        savedWords={savedWords}
                        onSaveWord={handleSaveWord}
                        onDeleteWord={handleDeleteWord}
                        onStudy={handleStudyWords}
                    />
                </>
            )}
        </div>
    );
};

export default App;