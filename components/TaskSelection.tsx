import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { SpeakButton } from './SpeakButton';

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
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const StopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6" />
    </svg>
);


interface TaskSelectionProps {
    onTaskSelect: (task: string) => void;
    onGoBack: () => void;
}

export const TaskSelection: React.FC<TaskSelectionProps> = ({ onTaskSelect, onGoBack }) => {
    const [customTask, setCustomTask] = useState('');
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
            setToastMessage('Listening...');
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setToastMessage(`Error: ${event.error}`);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            setCustomTask(currentTask => (currentTask ? currentTask + ' ' : '') + transcript);
            setToastMessage(`Added to custom task description.`);
        };
        recognitionRef.current = recognition;
    }, []);

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
    
    const handleGenerateCustom = () => {
        if (customTask.trim()) {
            onTaskSelect(customTask.trim());
        }
    };

    return (
        <>
            <Header points={0} onGoBack={onGoBack} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">What would you like to do?</h2>
                    <p className="mt-2 text-slate-600">Create a custom guide, or select from the list below.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
                    <h3 className="text-2xl font-bold text-slate-800">Create Your Own Guide</h3>
                    <p className="mt-1 text-slate-600 mb-4">Describe a task, and AI will create a step-by-step guide with images for you.</p>
                    
                    <div className="relative">
                        <textarea
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                            placeholder="e.g., How to bake a chocolate cake from scratch"
                            className="w-full h-24 p-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none pr-14"
                            aria-label="Custom task description"
                            disabled={isListening}
                        />
                         {isSpeechRecognitionSupported && (
                            <button 
                                onClick={handleToggleListening} 
                                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                aria-label={isListening ? 'Stop dictating' : 'Dictate custom task'}
                            >
                                {isListening ? <StopIcon /> : <MicIcon />}
                            </button>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleGenerateCustom} 
                            disabled={!customTask.trim()}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Generate Guide
                        </button>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <div className="inline-block relative w-full">
                        <hr className="border-slate-300" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 px-4 text-slate-500 font-medium">OR</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 mt-6">Select a Pre-defined Task</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {TASKS.map(task => (
                        <div key={task} className="flex items-center bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-sky-500">
                            <button
                                onClick={() => onTaskSelect(task)}
                                className="flex-grow text-left p-5 focus:outline-none"
                                aria-label={`Select task: ${task}`}
                            >
                                <span className="font-semibold text-slate-700">{task}</span>
                            </button>
                            <div className="pr-3">
                                <SpeakButton
                                    textToSpeak={task}
                                    ariaLabel={`Read task name: ${task}`}
                                />
                            </div>
                        </div>
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