import React from 'react';

const InvertIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2V4a8 8 0 0 1 0 16z"/>
    </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" />
    </svg>
);

interface GlobalAccessibilityControlsProps {
    isInverted: boolean;
    onToggleInvert: () => void;
    brightness: number;
    onBrightnessChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GlobalAccessibilityControls: React.FC<GlobalAccessibilityControlsProps> = ({
    isInverted,
    onToggleInvert,
    brightness,
    onBrightnessChange,
}) => {
    return (
        <>
            {/* Color Inversion Toggle */}
            <button
                onClick={onToggleInvert}
                className={`fixed top-4 right-4 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                    isInverted ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
                aria-label={isInverted ? 'Disable color inversion' : 'Enable color inversion'}
                title={isInverted ? 'Disable Color Inversion' : 'Enable Color Inversion'}
            >
                <InvertIcon className="h-6 w-6" />
            </button>

            {/* Brightness Slider */}
            <div className="fixed bottom-4 right-4 z-40 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center space-x-3">
                 <SunIcon className="h-6 w-6 text-slate-600" />
                 <input
                    type="range"
                    min="50"
                    max="150"
                    step="10"
                    value={brightness}
                    onChange={onBrightnessChange}
                    className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    aria-label="Adjust website brightness"
                />
                 <span className="text-sm font-medium text-slate-700 w-10 text-center">{brightness}%</span>
            </div>
        </>
    );
};