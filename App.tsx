import React, { useState } from 'react';
import { TaskSelection } from './components/TaskSelection';
import { TaskGuide } from './components/TaskGuide';
import { AccessibilityModeSelection } from './components/AccessibilityModeSelection';
import { ColorBlindnessTool } from './components/ColorBlindnessTool';
import { GlobalAccessibilityControls } from './components/GlobalAccessibilityControls';
import { HearingImpairmentTool } from './components/HearingImpairmentTool';
import type { TaskProgress } from './types';

type AppMode = 'selection' | 'visual' | 'cognitive' | 'hearing';


const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('selection');
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [isInverted, setIsInverted] = useState(false);
    const [brightness, setBrightness] = useState(100); // Percentage
    const [tasksProgress, setTasksProgress] = useState<Record<string, TaskProgress>>({});

    const handleModeSelect = (selectedMode: 'visual' | 'cognitive' | 'hearing') => {
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

    const handleToggleInvert = () => setIsInverted(prev => !prev);

    const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBrightness(Number(event.target.value));
    };

    const handleProgressUpdate = (taskName: string, progressUpdate: Partial<TaskProgress>) => {
        setTasksProgress(prev => {
            const existingProgress = prev[taskName] || {
                steps: [],
                completedSteps: new Set(),
                totalPoints: 0,
            };
            return {
                ...prev,
                [taskName]: {
                    ...existingProgress,
                    ...progressUpdate,
                },
            };
        });
    };


    const renderContent = () => {
        switch (mode) {
            case 'visual':
                return <ColorBlindnessTool onGoBack={handleGoToMainMenu} />;
            case 'cognitive':
                const currentProgress = tasksProgress[selectedTask || ''] || {
                    steps: [],
                    completedSteps: new Set(),
                    totalPoints: 0,
                };
                return selectedTask ? (
                    <TaskGuide
                        taskName={selectedTask}
                        onGoBack={handleGoBackFromTask}
                        initialProgress={currentProgress}
                        onProgressUpdate={handleProgressUpdate}
                    />
                ) : (
                    <TaskSelection onTaskSelect={handleTaskSelect} onGoBack={handleGoToMainMenu} />
                );
            case 'hearing':
                return <HearingImpairmentTool onGoBack={handleGoToMainMenu} />;
            case 'selection':
            default:
                return <AccessibilityModeSelection onSelectMode={handleModeSelect} />;
        }
    };

    return (
        <div>
            <GlobalAccessibilityControls
                isInverted={isInverted}
                onToggleInvert={handleToggleInvert}
                brightness={brightness}
                onBrightnessChange={handleBrightnessChange}
            />
            <div
                className="min-h-screen bg-slate-100 font-sans text-slate-800 transition-all duration-300"
                style={{
                    filter: `invert(${isInverted ? 1 : 0}) brightness(${brightness / 100})`,
                }}
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default App;