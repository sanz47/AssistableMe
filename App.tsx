import React, { useState, useMemo, useEffect } from 'react';
import { TaskSelection } from './components/TaskSelection';
import { TaskGuide } from './components/TaskGuide';
import { AccessibilityModeSelection } from './components/AccessibilityModeSelection';
import { ColorBlindnessTool } from './components/ColorBlindnessTool';
import { GlobalAccessibilityControls } from './components/GlobalAccessibilityControls';
import { HearingImpairmentTool } from './components/HearingImpairmentTool';
import type { TaskProgress } from './types';

type AppMode = 'selection' | 'visual' | 'cognitive' | 'hearing';

const loadTasksProgress = (): Record<string, TaskProgress> => {
    try {
        const savedProgress = localStorage.getItem('app_tasks_progress');
        if (!savedProgress) return {};
        const parsed = JSON.parse(savedProgress);
        // Convert saved arrays back to Sets
        for (const taskName in parsed) {
            if (parsed[taskName].completedSteps && Array.isArray(parsed[taskName].completedSteps)) {
                parsed[taskName].completedSteps = new Set(parsed[taskName].completedSteps);
            } else {
                parsed[taskName].completedSteps = new Set();
            }
        }
        return parsed;
    } catch (error) {
        console.error("Failed to load tasks progress from localStorage", error);
        return {};
    }
};


const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('selection');
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [isInverted, setIsInverted] = useState(false);
    const [brightness, setBrightness] = useState(100); // Percentage
    const [tasksProgress, setTasksProgress] = useState<Record<string, TaskProgress>>(loadTasksProgress);

    useEffect(() => {
        try {
            const progressToSave: Record<string, any> = {};
            for (const taskName in tasksProgress) {
                progressToSave[taskName] = {
                    ...tasksProgress[taskName],
                    // Convert Set to Array for JSON serialization
                    completedSteps: Array.from(tasksProgress[taskName].completedSteps || []),
                };
            }
            localStorage.setItem('app_tasks_progress', JSON.stringify(progressToSave));
        } catch (error) {
            console.error("Failed to save tasks progress to localStorage", error);
        }
    }, [tasksProgress]);
    
    const totalPoints = useMemo(() => {
        return Object.values(tasksProgress).reduce((acc, progress) => acc + (progress.totalPoints || 0), 0);
    }, [tasksProgress]);

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
    
    const handleDeleteTaskProgress = (taskName: string) => {
        setTasksProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[taskName];
            return newProgress;
        });
    };


    const renderContent = () => {
        switch (mode) {
            case 'visual':
                return <ColorBlindnessTool onGoBack={handleGoToMainMenu} totalPoints={totalPoints} />;
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
                        totalPoints={totalPoints}
                    />
                ) : (
                    <TaskSelection
                        onTaskSelect={handleTaskSelect}
                        onGoBack={handleGoToMainMenu}
                        totalPoints={totalPoints}
                        onDeleteTask={handleDeleteTaskProgress}
                    />
                );
            case 'hearing':
                return <HearingImpairmentTool onGoBack={handleGoToMainMenu} totalPoints={totalPoints} />;
            case 'selection':
            default:
                return <AccessibilityModeSelection onSelectMode={handleModeSelect} totalPoints={totalPoints} />;
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