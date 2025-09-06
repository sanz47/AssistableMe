import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { findMatchingTask } from '../services/geminiService';

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const TASKS = [
    "Washing a car",
    "Reshelving library books",
    "Factory assembly work",
    "Running photocopies",
    "Janitor jobs",
    "Restocking shelves",
    "Sorting at a recycling plant",
    "Loading trucks in a warehouse",
    "Lawn and garden work",
    "Fast food restaurant cooking",
    "Watering office plants",
    "Clerk and filing jobs",
    "Tuning a piano",
    "Running laboratory equipment",
    "Inventory control",
    "Dog obedience training",
    "Copy editing a manuscript",
    "Professional photography"
];

const MicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-white"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);


interface TaskSelectionProps {
    onTaskSelect: (task: string) => void;
    onGoBack: () => void;
}

export const TaskSelection: React.FC<TaskSelectionProps> = ({ onTaskSelect, onGoBack }) => {
    const [isListening, setIsListening] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        if (!isSpeechRecognitionSupported) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setToastMessage('Listening for a task name...');
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setToastMessage(`Error: ${event.error}`);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            setToastMessage(`Heard: "${transcript}". Finding match...`);

            const foundTask = await findMatchingTask(transcript, TASKS);

            if (foundTask) {
                setToastMessage(`Found task: "${foundTask}"`);
                setTimeout(() => onTaskSelect(foundTask), 1200);
            } else {
                setToastMessage(`Sorry, I couldn't find a matching task for "${transcript}"`);
            }
        };
        recognitionRef.current = recognition;
    }, [onTaskSelect]);

    const handleToggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch(e) {
                console.error("Could not start recognition", e);
                setToastMessage('Could not start listening.');
            }
        }
    };


    return (
        <>
            <Header points={0} onGoBack={onGoBack} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">What would you like to do?</h2>
                    <p className="mt-2 text-slate-600">Select a task below, or use your voice to get started.</p>
                </div>

                {isSpeechRecognitionSupported && (
                    <div className="text-center mb-10">
                        <button
                            onClick={handleToggleListening}
                            className={`inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-white shadow-lg transition-all transform hover:scale-105 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-sky-500 hover:bg-sky-600'}`}
                            aria-label={isListening ? 'Stop listening' : 'Start voice command to select a task'}
                        >
                           <MicIcon className="h-6 w-6 mr-3"/>
                           {isListening ? 'Listening...' : 'Select with Voice'}
                        </button>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {TASKS.map(task => (
                        <button
                            key={task}
                            onClick={() => onTaskSelect(task)}
                            className="text-left p-5 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <span className="font-semibold text-slate-700">{task}</span>
                        </button>
                    ))}
                </div>
            </main>
            {toastMessage && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                    {toastMessage}
                </div>
             )}
        </>
    );
};
