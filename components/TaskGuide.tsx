import React, { useState, useEffect, useCallback, useRef, createRef } from 'react';
import { Header } from './Header';
import { StepCard } from './StepCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorDisplay } from './ErrorDisplay';
import { generateTaskSteps } from '../services/geminiService';
import type { TaskStep, TaskProgress } from '../types';
import { VoiceControl } from './VoiceControl';

interface TaskGuideProps {
    taskName: string;
    onGoBack: () => void;
    initialProgress: TaskProgress;
    onProgressUpdate: (taskName: string, progress: Partial<TaskProgress>) => void;
    totalPoints: number;
}

export const TaskGuide: React.FC<TaskGuideProps> = ({ taskName, onGoBack, initialProgress, onProgressUpdate, totalPoints }) => {
  const [isLoading, setIsLoading] = useState<boolean>(!initialProgress.steps || initialProgress.steps.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [confettiStep, setConfettiStep] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const stepRefs = useRef<React.RefObject<HTMLElement>[]>([]);

  // Get progress state from props
  const { steps, completedSteps, totalPoints: taskPoints } = initialProgress;

  const fetchSteps = useCallback(async () => {
    // This is called only when steps are needed
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSteps = await generateTaskSteps(taskName);
      onProgressUpdate(taskName, { steps: fetchedSteps });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : `An unknown error occurred while fetching steps for ${taskName}.`);
    } finally {
      setIsLoading(false);
    }
  }, [taskName, onProgressUpdate]);

  useEffect(() => {
    if (!steps || steps.length === 0) {
      fetchSteps();
    } else {
      // Steps are loaded, ensure refs match the step count
      stepRefs.current = steps.map((_, i) => stepRefs.current[i] || createRef<HTMLElement>());
    }
  }, [steps, fetchSteps]);

  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => {
            setToastMessage('');
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleCompleteStep = (stepIndex: number, points: number) => {
    if (completedSteps.has(stepIndex)) return;

    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(stepIndex);
    const newTotalPoints = taskPoints + points;
    
    onProgressUpdate(taskName, {
        completedSteps: newCompletedSteps,
        totalPoints: newTotalPoints,
    });

    setToastMessage(`+${points} points! Great job!`);
    
    setConfettiStep(stepIndex);
    setTimeout(() => setConfettiStep(null), 4000); // Confetti duration
  };

  const handleVoiceCommand = useCallback((command: string) => {
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            setToastMessage('Text-to-speech not supported.');
        }
    };

    const readMatch = command.match(/read step (\d+)/);
    if (readMatch) {
        const stepNum = parseInt(readMatch[1], 10);
        if (stepNum > 0 && stepNum <= steps.length) {
            const stepIndex = stepNum - 1;
            const step = steps[stepIndex];
            setToastMessage(`Reading step ${stepNum}.`);
            speak(`${step.title}. ${step.description}`);
            stepRefs.current[stepIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }
    
    if (command.includes('next')) {
        let nextStepIndex = steps.findIndex((_, index) => !completedSteps.has(index));
        if (nextStepIndex === -1) nextStepIndex = steps.length - 1; 
        setToastMessage('Going to the next step.');
        stepRefs.current[nextStepIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    if (command.includes('previous') || command.includes('go back')) {
        if (completedSteps.size > 0) {
           const lastCompleted = Math.max(...Array.from(completedSteps));
           const prevIndex = Math.max(0, lastCompleted - 1);
           setToastMessage('Going to previous step.');
           stepRefs.current[prevIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
           setToastMessage('You are at the start!');
        }
        return;
    }

    setToastMessage(`Unknown command: "${command}"`);

  }, [steps, completedSteps]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} onRetry={fetchSteps} />;
    }

    return (
      <div className="space-y-8">
        {(steps || []).map((step, index) => (
          <StepCard
            key={index}
            ref={stepRefs.current[index]}
            step={step}
            stepNumber={index + 1}
            isCompleted={completedSteps.has(index)}
            showConfetti={confettiStep === index}
            onComplete={handleCompleteStep}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header points={totalPoints} taskName={taskName} onGoBack={onGoBack} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {renderContent()}
      </main>
      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>Powered by Gemini AI</p>
      </footer>
       <VoiceControl onCommand={handleVoiceCommand} setToastMessage={setToastMessage} />
      {toastMessage && (
        <div className="fixed bottom-24 right-5 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 animate-fade-in-up">
            {toastMessage}
        </div>
      )}
    </>
  );
};