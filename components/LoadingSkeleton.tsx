
import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="h-10 w-10 rounded-full bg-slate-200"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
      <div className="mt-6 h-48 bg-slate-200 rounded-lg"></div>
    </div>
  );
};
