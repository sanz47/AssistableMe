import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { adjustImageForColorBlindness } from '../services/geminiService';

const COLOR_BLINDNESS_TYPES = {
  'Protanopia': 'Red-Blind',
  'Protanomaly': 'Red-Weak',
  'Deuteranopia': 'Green-Blind',
  'Deuteranomaly': 'Green-Weak',
  'Tritanopia': 'Blue-Blind',
  'Tritanomaly': 'Blue-Weak',
};

type ColorBlindnessType = keyof typeof COLOR_BLINDNESS_TYPES;

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ImagePlaceholder: React.FC<{ title: string; children?: React.ReactNode; isLoading?: boolean; isError?: boolean; errorMessage?: string; }> = ({ title, children, isLoading, isError, errorMessage }) => (
    <div className="w-full">
        <h3 className="text-lg font-semibold text-slate-700 mb-2 text-center">{title}</h3>
        <div className={`relative w-full aspect-video rounded-xl flex flex-col items-center justify-center bg-slate-200 border-2 border-dashed ${isError ? 'border-red-400' : 'border-slate-300'} p-4`}>
            {children}
            {isLoading && (
                 <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-sky-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                     <p className="mt-2 text-slate-600">AI is adjusting colors...</p>
                 </div>
            )}
             {isError && (
                 <div className="text-center text-red-600">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{errorMessage}</p>
                 </div>
            )}
        </div>
    </div>
);


export const ColorBlindnessTool: React.FC<{ onGoBack: () => void; }> = ({ onGoBack }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<ColorBlindnessType>('Protanopia');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setOriginalImage(result);
                setGeneratedImage(null);
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

        try {
            const mimeType = originalImage.substring(5, originalImage.indexOf(';'));
            const base64ImageData = originalImage.split(',')[1];
            
            const result = await adjustImageForColorBlindness(base64ImageData, mimeType, selectedType);
            setGeneratedImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, selectedType]);

    return (
        <>
            <Header points={0} taskName="Color Vision Tool" onGoBack={onGoBack} />
            <main className="container mx-auto max-w-6xl px-4 py-8">
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
                        <div>
                            <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 mb-1">Upload Image</label>
                            <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                        </div>
                        <div>
                            <label htmlFor="colorblind-type" className="block text-sm font-medium text-slate-700 mb-1">Color Blindness Type</label>
                            <select id="colorblind-type" value={selectedType} onChange={(e) => setSelectedType(e.target.value as ColorBlindnessType)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                                {Object.entries(COLOR_BLINDNESS_TYPES).map(([key, value]) => (
                                    <option key={key} value={key}>{value} ({key})</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading || !originalImage} className="w-full md:w-auto justify-self-stretch md:justify-self-end px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Generate Correction'}
                        </button>
                    </div>

                    {error && !isLoading && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
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
                                <div className="text-center text-slate-500">
                                    <UploadIcon />
                                    <p>Upload an image to get started</p>
                                </div>
                            )}
                        </ImagePlaceholder>
                        <ImagePlaceholder title="AI Corrected Image" isLoading={isLoading} isError={!!error && isLoading} errorMessage={error || undefined}>
                             {generatedImage && !isLoading && (
                                <img src={generatedImage} alt="AI corrected for color blindness" className="w-full h-full object-contain rounded-lg"/>
                            )}
                        </ImagePlaceholder>
                    </div>
                </div>
            </main>
        </>
    );
};
