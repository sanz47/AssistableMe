import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { adjustImageForColorBlindness } from '../services/geminiService';
import { SpeakButton } from './SpeakButton';

const COLOR_BLINDNESS_TYPES = {
  'Protanopia': 'Red-Blind',
  'Protanomaly': 'Red-Weak',
  'Deuteranopia': 'Green-Blind',
  'Deuteranomaly': 'Green-Weak',
  'Tritanopia': 'Blue-Blind',
  'Tritanomaly': 'Blue-Weak',
  'Nyctalopia': 'Night Mode (Low Light)',
};

type ColorBlindnessType = keyof typeof COLOR_BLINDNESS_TYPES;

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ImagePlaceholder: React.FC<{ title: string; children?: React.ReactNode; isLoading?: boolean; isError?: boolean; errorMessage?: string; }> = ({ title, children, isLoading, isError, errorMessage }) => (
    <div className="w-full">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2 text-center">{title}</h3>
        <div className={`relative w-full aspect-video rounded-xl flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700/50 border-2 border-dashed ${isError ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'} p-4 transition-colors`}>
            {children}
            {isLoading && (
                 <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex flex-col items-center justify-center rounded-xl">
                    <svg className="w-10 h-10 text-sky-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                     <p className="mt-2 text-slate-600 dark:text-slate-300">AI is adjusting colors...</p>
                 </div>
            )}
             {isError && (
                 <div className="text-center text-red-600 dark:text-red-400">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{errorMessage}</p>
                 </div>
            )}
        </div>
    </div>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


export const ColorBlindnessTool: React.FC<{ onGoBack: () => void; }> = ({ onGoBack }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageDescription, setImageDescription] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<ColorBlindnessType>('Protanopia');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setOriginalImage(result);
                setGeneratedImage(null);
                setImageDescription(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        } else {
            setError("Please select a valid image file.");
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!originalImage || !selectedType) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setImageDescription(null);

        try {
            const mimeType = originalImage.substring(5, originalImage.indexOf(';'));
            const base64ImageData = originalImage.split(',')[1];
            
            const result = await adjustImageForColorBlindness(base64ImageData, mimeType, selectedType);
            setGeneratedImage(result.correctedImage);
            setImageDescription(result.description);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, selectedType]);

    return (
        <div className={theme}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Header points={0} taskName="Color Vision Tool" onGoBack={onGoBack} />
                <main className="container mx-auto max-w-6xl px-4 py-8">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                        {/* Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end mb-6">
                            <div className="lg:col-span-1">
                                <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Image</label>
                                <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/50 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-800/50 transition-colors"/>
                            </div>
                            <div className="lg:col-span-1">
                                <label htmlFor="colorblind-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color Vision Type</label>
                                <select id="colorblind-type" value={selectedType} onChange={(e) => setSelectedType(e.target.value as ColorBlindnessType)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 transition-colors">
                                    {Object.entries(COLOR_BLINDNESS_TYPES).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-start md:col-start-3 lg:col-start-auto lg:justify-end gap-4">
                                <div className="flex items-center gap-2">
                                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">Theme</span>
                                     <button onClick={toggleTheme} type="button" className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${theme === 'dark' ? 'bg-sky-600' : 'bg-slate-200'}`} role="switch" aria-checked={theme === 'dark'} aria-label="Toggle theme">
                                        <span className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                                            <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${theme === 'dark' ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'}`} aria-hidden="true">
                                                <SunIcon className="h-3 w-3 text-slate-400" />
                                            </span>
                                             <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${theme === 'dark' ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'}`} aria-hidden="true">
                                                <MoonIcon className="h-3 w-3 text-sky-600" />
                                            </span>
                                        </span>
                                     </button>
                                </div>
                            </div>
                            <button onClick={handleGenerate} disabled={isLoading || !originalImage} className="w-full justify-self-stretch px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                                {isLoading ? 'Generating...' : 'Generate Correction'}
                            </button>
                        </div>

                        {error && !isLoading && (
                            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-md mb-6 transition-colors" role="alert">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {/* Image Previews */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ImagePlaceholder title="Original Image">
                                {originalImage ? (
                                    <img src={originalImage} alt="Original upload" className="w-full h-full object-contain rounded-lg"/>
                                ) : (
                                    <div className="text-center text-slate-500 dark:text-slate-400">
                                        <UploadIcon />
                                        <p>Upload an image to get started</p>
                                    </div>
                                )}
                            </ImagePlaceholder>
                            <div>
                                <ImagePlaceholder title="AI Corrected Image" isLoading={isLoading} isError={!!error && isLoading} errorMessage={error || undefined}>
                                    {generatedImage && !isLoading && (
                                        <img src={generatedImage} alt="AI corrected for color blindness" className="w-full h-full object-contain rounded-lg"/>
                                    )}
                                </ImagePlaceholder>
                                {generatedImage && !isLoading && imageDescription && (
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Image Description</h4>
                                            <SpeakButton 
                                                textToSpeak={imageDescription}
                                                ariaLabel="Read image description"
                                            />
                                        </div>
                                        <p className="mt-2 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{imageDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};