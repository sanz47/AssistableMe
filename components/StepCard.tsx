import React, { useState, useEffect } from 'react';
import type { TaskStep } from '../types';
import { generateImageForStep } from '../services/geminiService';
import { Confetti } from './Confetti';

interface StepCardProps {
  step: TaskStep;
  stepNumber: number;
  isCompleted: boolean;
  showConfetti: boolean;
  onComplete: (stepNumber: number, points: number) => void;
}

const ImagePlaceholder: React.FC<{ message: string, isError?: boolean }> = ({ message, isError = false }) => (
  <div className={`w-full aspect-video rounded-lg flex flex-col items-center justify-center bg-slate-200 ${isError ? 'ring-2 ring-red-400' : ''}`}>
    {isError ? (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>
    ) : (
      <svg className="w-10 h-10 text-slate-400 animate-spin mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )}
    <p className={`text-sm font-medium ${isError ? 'text-red-500' : 'text-slate-500'}`}>{message}</p>
  </div>
);

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const StepCard = React.forwardRef<HTMLElement, StepCardProps>(
  ({ step, stepNumber, isCompleted, showConfetti, onComplete }, ref) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const url = await generateImageForStep(step.image_prompt);
                setImageUrl(url);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown image generation error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step.image_prompt]);
    
    const POINTS_PER_STEP = 10;

    return (
        <article ref={ref} className={`bg-white shadow-lg rounded-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 relative ${isCompleted ? 'ring-2 ring-green-400' : ''}`}>
        {showConfetti && <Confetti />}
        <div className={`p-6 transition-opacity duration-500 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full font-bold text-lg text-white transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-sky-500'}`}>
                    {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : stepNumber}
                </div>
                <div className="flex-grow">
                    <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
                    <p className="mt-1 text-slate-600">{step.description}</p>
                </div>
                {isCompleted && <CheckmarkIcon />}
            </div>
            <div className="mt-6">
                {isLoading && <ImagePlaceholder message="Generating image..." />}
                {error && <ImagePlaceholder message={error} isError={true} />}
                {imageUrl && !isLoading && (
                    <img
                        src={imageUrl}
                        alt={step.title}
                        className="w-full h-auto object-cover rounded-lg shadow-md"
                    />
                )}
            </div>
            {!isCompleted && (
                <div className="mt-6 text-right">
                    <button
                        onClick={() => onComplete(stepNumber - 1, POINTS_PER_STEP)}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
                        aria-label={`Mark step ${stepNumber} as done`}
                    >
                        Mark as Done
                    </button>
                </div>
            )}
        </div>
      </article>
    );
});
