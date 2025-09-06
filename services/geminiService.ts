import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { TaskStep } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const taskStepsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A short, clear title for the step.'
      },
      description: {
        type: Type.STRING,
        description: 'A detailed explanation of how to perform this step.'
      },
      image_prompt: {
        type: Type.STRING,
        description: 'A detailed, photorealistic prompt for an AI image generator to visualize this step. e.g., "Photorealistic image of a person doing a specific action related to the step."'
      },
    },
    required: ["title", "description", "image_prompt"],
  },
};

export async function generateTaskSteps(taskName: string): Promise<TaskStep[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 7 detailed steps for the task: "${taskName}". For each step, provide a title, a description, and a detailed image_prompt for an AI image generator. Respond in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskStepsSchema,
      },
    });

    const jsonText = response.text.trim();
    const steps = JSON.parse(jsonText) as TaskStep[];
    return steps;
  } catch (error) {
    console.error(`Error generating steps for ${taskName}:`, error);
    throw new Error(`Failed to generate steps for "${taskName}" from AI.`);
  }
}

export async function generateImageForStep(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview', // Using nano-banana model as requested by user
        contents: `${prompt}, ultra realistic, high detail, 8k`,
        config: {
            // Per documentation, this model requires specifying IMAGE and TEXT modalities for output
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    // Find the first image part in the response
    const imagePart = response.candidates?.[0]?.content?.parts.find(p => !!p.inlineData);

    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data;
        const mimeType: string = imagePart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    
    // If no image part is found, throw an error
    throw new Error("No image data was found in the API response.");

  } catch (error) {
    console.error("Error generating image:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate image from AI. Details: ${errorMessage}`);
  }
}

export async function findMatchingTask(transcript: string, availableTasks: string[]): Promise<string | null> {
  try {
    const prompt = `From the following list of tasks, which one is the best match for the user's request: "${transcript}"?

    Task List:
    - ${availableTasks.join('\n- ')}

    Respond with ONLY the single, exact task name from the list. If no task is a good match, respond with the word "None".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Disable thinking for faster, more direct responses for this classification task
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const matchedTask = response.text.trim();
    
    // Check if the model's response is a valid task from the list
    if (availableTasks.includes(matchedTask)) {
      return matchedTask;
    }

    return null; // Model responded with "None" or an invalid task name
  } catch (error) {
    console.error("Error finding matching task with AI:", error);
    return null; // Return null to handle the error gracefully in the UI
  }
}
