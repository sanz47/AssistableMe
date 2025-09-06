export interface TaskStep {
  title: string;
  description: string;
  image_prompt: string;
}

export interface TaskProgress {
    steps: TaskStep[];
    completedSteps: Set<number>;
    totalPoints: number;
}
