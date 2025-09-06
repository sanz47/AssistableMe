import React from 'react';

const WaterDropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.62 7.724a.75.75 0 00-1.24 0 10.363 10.363 0 000 4.552.75.75 0 001.24 0 8.863 8.863 0 010-4.552zM10 3.167a.75.75 0 01.75.75v11.166a.75.75 0 01-1.5 0V3.917a.75.75 0 01.75-.75zm3.38 4.557a.75.75 0 00-1.24 0 8.863 8.863 0 000 4.552.75.75 0 101.24 0 10.363 10.363 0 000-4.552z" clipRule="evenodd" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);


interface HeaderProps {
    points: number;
    taskName?: string;
    onGoBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ points, taskName, onGoBack }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            {onGoBack && (
                 <button 
                    onClick={onGoBack} 
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Go back to task selection"
                >
                    <BackIcon />
                </button>
            )}
            {!onGoBack && <WaterDropIcon />}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {taskName ? `Guide: ${taskName}` : 'AI Task Guide'}
            </h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full">
            <TrophyIcon />
            <span className="font-bold text-lg text-slate-700">{points}</span>
            <span className="hidden sm:inline text-sm text-slate-500">Points</span>
        </div>
      </div>
    </header>
  );
};
