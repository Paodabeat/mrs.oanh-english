import { useState, useRef, useEffect, useCallback } from 'react';

// Polyfill for browsers that use webkitSpeechRecognition
// FIX: Cast window to `any` to access browser-specific speech recognition APIs and prevent TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // FIX: Use `any` for the recognition ref type as the 'SpeechRecognition' type is not available in the standard TS lib and is shadowed by the constant on line 5.
  const recognition = useRef<any | null>(null);

  // Load voices when they are ready
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    // Initial load
    handleVoicesChanged();
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const finalTranscript = event.results[0][0].transcript;
      setTranscript(finalTranscript);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.current = rec;
  }, []);

  const startListening = useCallback(() => {
    if (recognition.current && !isListening && !isSpeaking) {
      try {
        recognition.current.start();
      } catch(e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  }, [isListening, isSpeaking]);

  const stopListening = useCallback(() => {
    if (recognition.current && isListening) {
      try {
        recognition.current.stop();
      } catch(e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis API is not supported in this browser.");
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Find a good quality English voice
    let selectedVoice = voices.find(voice => voice.name === 'Google US English' && voice.lang.startsWith('en'));
    if (!selectedVoice) {
       selectedVoice = voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Google'));
    }
    if (!selectedVoice) {
       selectedVoice = voices.find(voice => voice.lang.startsWith('en-US'));
    }
    if(selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (voices.length > 0) {
      // Fallback to the first available English voice
      utterance.voice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
    }
    
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  return { isListening, isSpeaking, transcript, speak, startListening, stopListening };
};

export default useSpeech;
