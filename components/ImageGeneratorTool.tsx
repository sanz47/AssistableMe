import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { generateImage } from '../services/geminiService';
import { SpeakButton } from './SpeakButton';

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

export const ImageGeneratorTool: React.FC<{ onGoBack: () => void; }> = ({ onGoBack }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            <Header points={0} taskName="AI Image Generator" onGoBack={onGoBack} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800">Describe the image you want to create</h2>
                    <p className="mt-1 text-slate-600 mb-4">Be as descriptive as you like. You can press Enter to generate.</p>
                    
                    <div className="relative">
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., A photorealistic image of a cat wearing a tiny wizard hat, sitting on a pile of ancient books."
                            className="w-full h-28 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none pr-12"
                            aria-label="Image description prompt"
                            disabled={isLoading}
                        />
                        <div className="absolute top-2 right-2">
                             <SpeakButton 
                                textToSpeak={prompt}
                                ariaLabel="Read the prompt"
                            />
                        </div>
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
        </>
    );
};