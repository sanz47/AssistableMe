import React, { useState } from 'react';
import { TaskSelection } from './components/TaskSelection';
import { TaskGuide } from './components/TaskGuide';
import { AccessibilityModeSelection } from './components/AccessibilityModeSelection';
import { ColorBlindnessTool } from './components/ColorBlindnessTool';

type AppMode = 'selection' | 'visual' | 'cognitive';

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('selection');
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const handleModeSelect = (selectedMode: 'visual' | 'cognitive') => {
        setMode(selectedMode);
    };

    const handleGoToMainMenu = () => {
        setMode('selection');
        setSelectedTask(null); // Ensure task is cleared when returning to main menu
    };
    
    const handleTaskSelect = (task: string) => {
        setSelectedTask(task);
    };

    const handleGoBackFromTask = () => {
        setSelectedTask(null); // This goes from TaskGuide back to TaskSelection
    };

    const renderContent = () => {
        switch (mode) {
            case 'visual':
                return <ColorBlindnessTool onGoBack={handleGoToMainMenu} />;
            case 'cognitive':
                return selectedTask ? (
                    <TaskGuide taskName={selectedTask} onGoBack={handleGoBackFromTask} />
                ) : (
                    <TaskSelection onTaskSelect={handleTaskSelect} onGoBack={handleGoToMainMenu} />
                );
            case 'selection':
            default:
                return <AccessibilityModeSelection onSelectMode={handleModeSelect} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            {renderContent()}
        </div>
    );
};

export default App;
