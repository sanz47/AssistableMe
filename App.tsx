import React, { useState } from 'react';
import { TaskSelection } from './components/TaskSelection';
import { TaskGuide } from './components/TaskGuide';

const App: React.FC = () => {
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const handleTaskSelect = (task: string) => {
        setSelectedTask(task);
    };

    const handleGoBack = () => {
        setSelectedTask(null);
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            {selectedTask ? (
                <TaskGuide taskName={selectedTask} onGoBack={handleGoBack} />
            ) : (
                <TaskSelection onTaskSelect={handleTaskSelect} />
            )}
        </div>
    );
};

export default App;
