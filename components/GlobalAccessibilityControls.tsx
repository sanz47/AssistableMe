import React from "react";
import { VoiceControl } from "./VoiceControl";
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z"
    />
  </svg>
);

interface GlobalAccessibilityControlsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  brightness: number;
  onBrightnessChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GlobalAccessibilityControls: React.FC<
  GlobalAccessibilityControlsProps
> = ({ isDarkMode, onToggleDarkMode, brightness, onBrightnessChange }) => {
  return (
    <>
{/*  */}

      {/* Brightness Slider */}
      <div className="fixed bottom-4 right-4 z-40 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center space-x-3 dark:bg-slate-800/80">
        <SunIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        <input
          type="range"
          min="50"
          max="150"
          step="10"
          value={brightness}
          onChange={onBrightnessChange}
          className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 dark:bg-slate-600"
          aria-label="Adjust website brightness"
        />
        <span className="text-sm font-medium text-slate-700 w-10 text-center dark:text-slate-200">
          {brightness}%
        </span>
      </div>
    </>
  );
};
