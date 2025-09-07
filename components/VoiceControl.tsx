import React, { useState, useEffect, useRef } from 'react';
import { findMatchingOption } from '../services/geminiService';

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access experimental browser APIs (SpeechRecognition) without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

interface VoiceControlProps {
    onCommandMatch: (command: string) => void;
    availableCommands: string[];
    setToastMessage: (message: string) => void;
    onNoMatch?: (transcript: string) => void;
}

const MicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

export const VoiceControl: React.FC<VoiceControlProps> = ({ onCommandMatch, availableCommands, setToastMessage, onNoMatch }) => {
    const [isListening, setIsListening] = useState(false);
    // FIX: Use `any` for the ref type because `SpeechRecognition` is defined as a constant value in this scope, causing a name collision.
    // This also addresses the issue of the `SpeechRecognition` type not being available in standard TypeScript libraries.
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setToastMessage('Listening...');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setToastMessage(`Error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            setToastMessage(`Heard: "${transcript}"`);
            
            if (!availableCommands || availableCommands.length === 0) {
                 if (onNoMatch) {
                    onNoMatch(transcript);
                } else {
                    setToastMessage(`No commands available.`);
                }
                return;
            }

            const matchedCommand = await findMatchingOption(transcript, availableCommands);

            if (matchedCommand) {
                onCommandMatch(matchedCommand);
            } else if (onNoMatch) {
                onNoMatch(transcript);
            } else {
                setToastMessage(`Unknown command: "${transcript}"`);
            }
        };

        recognitionRef.current = recognition;

    }, [availableCommands, onCommandMatch, onNoMatch, setToastMessage]);

    const handleToggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch(e) {
                console.error("Could not start recognition", e)
                setToastMessage('Could not start listening.');
            }
        }
    };
    
    if (!isSpeechRecognitionSupported) {
        return (
            <div className="fixed bottom-5 right-5 z-20 bg-slate-700 text-white p-3 rounded-full shadow-lg text-sm">
                Voice control not supported
            </div>
        );
    }

    return (
        <button
            onClick={handleToggleListening}
            className={`fixed bottom-5 right-5 z-50 h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-sky-500 hover:bg-sky-600'}`}
            aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        >
           <MicIcon />
        </button>
    );
};