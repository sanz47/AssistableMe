import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './Header';
import { generateImage } from '../services/geminiService';
import { VoiceControl } from './VoiceControl';

const ImageIconPlaceholder: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ImageDisplay: React.FC<{ children?: React.ReactNode; isLoading?: boolean; isError?: boolean; errorMessage?: string; }> = ({ children, isLoading, isError, errorMessage }) => (
    <div className={`relative w-full aspect-video rounded-xl flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-800 border-2 border-dashed ${isError ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-700'} p-4 mt-6`}>
        {children}
        {isLoading && (
             <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center rounded-xl">
                <svg className="w-10 h-10 text-sky-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                 <p className="mt-2 text-slate-600 dark:text-slate-300">AI is creating your image...</p>
             </div>
        )}
         {isError && (
             <div className="text-center text-red-600 dark:text-red-400">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{errorMessage}</p>
             </div>
        )}
    </div>
);

export const HearingImpairmentTool: React.FC<{ onGoBack: () => void; totalPoints: number; }> = ({ onGoBack, totalPoints }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string>('');

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

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
    
    const handleCommandMatch = (command: string) => {
        if (command === 'Generate Image') {
            handleGenerate();
        } else if (command === 'Go Back') {
            onGoBack();
        }
    };

    const handleNoMatch = (transcript: string) => {
        setPrompt(p => (p ? p + ' ' : '') + transcript);
    };

    return (
        <>
            <Header points={totalPoints} taskName="Visual Communication Tool" onGoBack={onGoBack} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Describe what you want to see</h2>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 mb-4">Type or use your voice to describe an image. The AI will create it for you. Press Enter to generate.</p>
                    
                    <div className="relative">
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., A visual of a person signing 'hello' in ASL, with clear hand movements."
                            className="w-full h-28 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none pr-14 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                            aria-label="Image description prompt"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="mt-4 text-right">
                        <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                    </div>

                    {error && !isLoading && !generatedImage && (
                        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-md mt-6" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <ImageDisplay isLoading={isLoading} isError={!!error && !generatedImage} errorMessage={error || undefined}>
                        {generatedImage && !isLoading ? (
                            <img src={generatedImage} alt={prompt} className="w-full h-full object-contain rounded-lg"/>
                        ) : !isLoading && (
                            <div className="text-center text-slate-500 dark:text-slate-400">
                                <ImageIconPlaceholder />
                                <p>Your generated image will appear here</p>
                            </div>
                        )}
                    </ImageDisplay>
                </div>
            </main>
            <VoiceControl
                availableCommands={['Generate Image', 'Go Back']}
                onCommandMatch={handleCommandMatch}
                onNoMatch={handleNoMatch}
                setToastMessage={setToastMessage}
            />
            {toastMessage && (
                <div className="fixed bottom-24 right-5 z-20 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                    {toastMessage}
                </div>
             )}
        </>
    );
};