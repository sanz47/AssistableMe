import React from 'react';
import { Header } from './Header';

const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const BrainIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);


interface AccessibilityModeSelectionProps {
    onSelectMode: (mode: 'visual' | 'cognitive') => void;
}

export const AccessibilityModeSelection: React.FC<AccessibilityModeSelectionProps> = ({ onSelectMode }) => {
    return (
        <>
            <Header points={0} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">AI Accessibility Suite</h2>
                    <p className="mt-3 text-lg text-slate-600">Select a tool designed to assist with your needs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button
                        onClick={() => onSelectMode('visual')}
                        className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-300"
                        aria-label="Select visual impairment tools"
                    >
                        <EyeIcon />
                        <h3 className="text-2xl font-bold mt-4 text-slate-800">Visual Impairment</h3>
                        <p className="mt-2 text-center text-slate-600">Adjust image colors for various types of color blindness to improve clarity.</p>
                    </button>
                    <button
                        onClick={() => onSelectMode('cognitive')}
                        className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300"
                        aria-label="Select cognitive disability guide"
                    >
                        <BrainIcon />
                        <h3 className="text-2xl font-bold mt-4 text-slate-800">Cognitive Disability</h3>
                        <p className="mt-2 text-center text-slate-600">Get interactive, step-by-step AI guides for completing complex tasks.</p>
                    </button>
                </div>
            </main>
        </>
    );
};
