import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './Header';
import { generateImage } from '../services/geminiService';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const ImageIconPlaceholder: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ImageDisplay: React.FC<{ children?: React.ReactNode; isLoading?: boolean; isError?: boolean; errorMessage?: string; }> = ({ children, isLoading, isError, errorMessage }) => (
    <div className={`relative w-full aspect-video rounded-xl flex flex-col items-center justify-center bg-slate-200 border-2 border-dashed ${isError ? 'border-red-400' : 'border-slate-300'} p-4 mt-6`}>
        {children}
        {isLoading && (
             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl">
                <svg className="w-10 h-10 text-sky-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                 <p className="mt-2 text-slate-600">AI is creating your image...</p>
             </div>
        )}
         {isError && (
             <div className="text-center text-red-600">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{errorMessage}</p>
             </div>
        )}
    </div>
);

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

export const HearingImpairmentTool: React.FC<{ onGoBack: () => void; }> = ({ onGoBack }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            setPrompt(currentPrompt => (currentPrompt ? currentPrompt + ' ' : '') + transcript);
            setToastMessage(`Heard: "${transcript}"`);
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

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a description for the image.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const result = await generateImage(prompt);
            setGeneratedImage(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while generating the image.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!isLoading && prompt) {
               handleGenerate();
            }
        }
    };

    return (
        <>
            <Header points={0} taskName="Visual Communication Tool" onGoBack={onGoBack} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800">Describe what you want to see</h2>
                    <p className="mt-1 text-slate-600 mb-4">Type or use your voice to describe an image. The AI will create it for you. Press Enter to generate.</p>
                    
                    <div className="relative">
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., A visual of a person signing 'hello' in ASL, with clear hand movements."
                            className="w-full h-28 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none pr-14"
                            aria-label="Image description prompt"
                            disabled={isLoading || isListening}
                        />
                        {isSpeechRecognitionSupported && (
                            <button 
                                onClick={handleToggleListening} 
                                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:bg-slate-100'}`}
                                aria-label={isListening ? 'Stop dictating' : 'Dictate description'}
                            >
                                {isListening ? <StopIcon /> : <MicIcon />}
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-4 text-right">
                        <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                    </div>

                    {error && !isLoading && !generatedImage && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-6" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <ImageDisplay isLoading={isLoading} isError={!!error && !generatedImage} errorMessage={error || undefined}>
                        {generatedImage && !isLoading ? (
                            <img src={generatedImage} alt={prompt} className="w-full h-full object-contain rounded-lg"/>
                        ) : !isLoading && (
                            <div className="text-center text-slate-500">
                                <ImageIconPlaceholder />
                                <p>Your generated image will appear here</p>
                            </div>
                        )}
                    </ImageDisplay>
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