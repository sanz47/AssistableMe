import React, { useState, useCallback, useEffect } from 'react';

// Self-contained hook logic
const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            console.warn("Text-to-speech not supported by this browser.");
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return { speak, stop, isSpeaking };
};


const SpeakIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6" />
    </svg>
);

interface SpeakButtonProps {
    textToSpeak: string;
    className?: string;
    ariaLabel: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({ textToSpeak, className, ariaLabel }) => {
    const { speak, stop, isSpeaking } = useTTS();

    const handleToggleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSpeaking) {
            stop();
        } else {
            speak(textToSpeak);
        }
    };

    if (!('speechSynthesis' in window)) {
        return null;
    }

    return (
        <button 
            onClick={handleToggleSpeak} 
            className={`p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors z-10 ${className}`}
            aria-label={isSpeaking ? 'Stop reading' : ariaLabel}
        >
            {isSpeaking ? <StopIcon /> : <SpeakIcon />}
        </button>
    );
};
