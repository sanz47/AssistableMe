import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { SpeakButton } from './SpeakButton';
import { VoiceControl } from './VoiceControl';
import { parseCustomTask } from '../services/geminiService';

const TASKS_INITIAL = [
    "Washing a car",
    "Reshelving library books",
    "Factory assembly work",
    "Running photocopies",
    "Janitor jobs",
    "Restocking shelves",
    "Sorting at a recycling plant",
    "Loading trucks in a warehouse",
    "Lawn and garden work",
    "Fast food restaurant cooking",
    "Watering office plants",
    "Clerk and filing jobs",
    "Tuning a piano",
    "Running laboratory equipment",
    "Inventory control",
    "Dog obedience training",
    "Copy editing a manuscript",
    "Professional photography"
];

// --- Icons ---
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5" 
    fill={filled ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={filled ? 0 : 2}
  >
    <polygon
      strokeLinecap="round" 
      strokeLinejoin="round"
      points="12,2 15,8.5 22,9.3 17,14.2 18.4,21 12,17.8 5.6,21 7,14.2 2,9.3 9,8.5"
    />
  </svg>
);


const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// --- Child Component for Task Items ---
interface TaskListItemProps {
    task: string;
    isFavorite: boolean;
    onSelect: () => void;
    onToggleFavorite: () => void;
    onDelete: () => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ task, isFavorite, onSelect, onToggleFavorite, onDelete }) => {
    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div className="flex items-center bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-sky-500 dark:bg-slate-700">
            <button
                onClick={onSelect}
                className="flex-grow text-left p-4 focus:outline-none"
                aria-label={`Select task: ${task}`}
            >
                <span className="font-semibold text-slate-700 dark:text-slate-200">{task}</span>
            </button>
            <div className="flex items-center pr-1">
                <SpeakButton textToSpeak={task} ariaLabel={`Read task name: ${task}`} />
                <button onClick={handleToggleFavorite} className="p-2 rounded-full text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-600" aria-label={isFavorite ? `Unfavorite ${task}` : `Favorite ${task}`}>
                    <StarIcon filled={isFavorite} />
                </button>
                <button onClick={handleDelete} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-600 dark:hover:text-red-400" aria-label={`Delete ${task}`}>
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};


interface TaskSelectionProps {
    onTaskSelect: (task: string) => void;
    onGoBack: () => void;
    totalPoints: number;
    onDeleteTask: (taskName: string) => void;
}

export const TaskSelection: React.FC<TaskSelectionProps> = ({ onTaskSelect, onGoBack, totalPoints, onDeleteTask }) => {
    const [customTask, setCustomTask] = useState('');
    const [toastMessage, setToastMessage] = useState<string>('');
    
    // --- Task State Management ---
    const [tasks, setTasks] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('app_tasks_all');
            return saved ? JSON.parse(saved) : TASKS_INITIAL;
        } catch {
            return TASKS_INITIAL;
        }
    });

    const [favorites, setFavorites] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('app_tasks_favorites');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const [recents, setRecents] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('app_tasks_recents');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const handleTaskSelect = (task: string) => {
        const newRecents = [task, ...recents.filter(t => t !== task)].slice(0, 5);
        setRecents(newRecents);
        localStorage.setItem('app_tasks_recents', JSON.stringify(newRecents));
        onTaskSelect(task);
    };

    const handleGenerateCustom = (task?: string) => {
        const trimmedTask = (task || customTask).trim();
        if (trimmedTask) {
            if (!tasks.includes(trimmedTask)) {
                const newTasks = [trimmedTask, ...tasks];
                setTasks(newTasks);
                localStorage.setItem('app_tasks_all', JSON.stringify(newTasks));
            }
            handleTaskSelect(trimmedTask);
            setCustomTask('');
        }
    };
    
    const handleToggleFavorite = (task: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(task)) {
            newFavorites.delete(task);
        } else {
            newFavorites.add(task);
        }
        setFavorites(newFavorites);
        localStorage.setItem('app_tasks_favorites', JSON.stringify(Array.from(newFavorites)));
    };

    const handleDeleteTask = (taskToDelete: string) => {
        if (window.confirm(`Are you sure you want to delete "${taskToDelete}"? This cannot be undone.`)) {
            const newTasks = tasks.filter(t => t !== taskToDelete);
            setTasks(newTasks);
            localStorage.setItem('app_tasks_all', JSON.stringify(newTasks));

            const newFavs = new Set(favorites);
            if (newFavs.has(taskToDelete)) {
                newFavs.delete(taskToDelete);
                setFavorites(newFavs);
                localStorage.setItem('app_tasks_favorites', JSON.stringify(Array.from(newFavs)));
            }

            const newRecents = recents.filter(t => t !== taskToDelete);
            setRecents(newRecents);
            localStorage.setItem('app_tasks_recents', JSON.stringify(newRecents));
            
            onDeleteTask(taskToDelete);
            setToastMessage(`"${taskToDelete}" has been deleted.`);
        }
    };

    const favoriteTasks = tasks.filter(task => favorites.has(task));
    const recentTasks = recents.filter(task => tasks.includes(task)); // Ensure recent task still exists in main list

    const handleCommandMatch = (command: string) => {
        if (command === 'Generate Guide') {
            handleGenerateCustom();
        } else if (command === 'Go Back') {
            onGoBack();
        } else if (tasks.includes(command)) {
            handleTaskSelect(command);
        } else {
            setToastMessage(`Action: ${command}`);
        }
    };

    const handleNoMatch = async (transcript: string) => {
        const parsedTask = await parseCustomTask(transcript);
        if (parsedTask) {
            setToastMessage(`Creating guide for: "${parsedTask}"`);
            handleGenerateCustom(parsedTask);
        } else {
            setToastMessage(`Unknown command: "${transcript}"`);
        }
    };

    const renderTaskSection = (taskList: string[], title: string) => {
         if (taskList.length === 0) return null;
         return (
            <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-700 mb-4 dark:text-slate-200">{title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {taskList.map(task => (
                        <TaskListItem
                            key={task}
                            task={task}
                            isFavorite={favorites.has(task)}
                            onSelect={() => handleTaskSelect(task)}
                            onToggleFavorite={() => handleToggleFavorite(task)}
                            onDelete={() => handleDeleteTask(task)}
                        />
                    ))}
                </div>
            </div>
         );
    }

    return (
        <>
            <Header points={totalPoints} onGoBack={onGoBack} />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">What would you like to do?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Create a custom guide, or select from the list below.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg mb-10 dark:bg-slate-800">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Your Own Guide</h3>
                    <p className="mt-1 text-slate-600 mb-4 dark:text-slate-400">Describe a task, and AI will create a step-by-step guide with images for you.</p>
                    
                    <div className="relative">
                        <textarea
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                            placeholder="e.g., How to bake a chocolate cake from scratch"
                            className="w-full h-24 p-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                            aria-label="Custom task description"
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => handleGenerateCustom()} 
                            disabled={!customTask.trim()}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Generate Guide
                        </button>
                    </div>
                </div>

                {renderTaskSection(favoriteTasks, "⭐ Favorite Tasks")}
                {renderTaskSection(recentTasks, "🕓 Recent Tasks")}

                {(favoriteTasks.length > 0 || recentTasks.length > 0) && (
                     <div className="text-center mb-6">
                        <div className="inline-block relative w-full">
                            <hr className="border-slate-300 dark:border-slate-700" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 dark:bg-slate-900 px-4 text-slate-500 font-medium dark:text-slate-400">ALL TASKS</span>
                        </div>
                    </div>
                )}
                
                {tasks.length > 0 ?
                    renderTaskSection(tasks, favoriteTasks.length === 0 && recentTasks.length === 0 ? "All Tasks" : "")
                    : (
                    <div className="text-center p-8 bg-white rounded-lg shadow dark:bg-slate-800">
                       <p className="text-slate-500 dark:text-slate-400">No tasks here. Try creating a custom guide!</p>
                    </div>
                )}
            </main>
            <VoiceControl
                availableCommands={[...tasks, 'Generate Guide', 'Go Back']}
                onCommandMatch={handleCommandMatch}
                onNoMatch={handleNoMatch}
                setToastMessage={setToastMessage}
            />
            {toastMessage && (
                <div className="fixed bottom-24 right-5 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                    {toastMessage}
                </div>
             )}
        </>
    );
};
