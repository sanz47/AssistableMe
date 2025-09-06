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

const COLOR_BLINDNESS_PROMPTS = {
  'Protanopia': 'The user has Protanopia (red-blindness) and has no red cones. Adjust the image to make it easier to see by shifting red hues towards distinguishable colors like oranges or blues, and increasing contrast with greens.',
  'Protanomaly': 'The user has Protanomaly (red-weakness) and has malfunctioning red cones. Enhance the reds in the image to make them more vibrant and distinct from greens.',
  'Deuteranopia': 'The user has Deuteranopia (green-blindness) and has no green cones. Adjust the image by shifting green hues towards distinguishable colors like magentas or oranges, and increasing contrast with reds.',
  'Deuteranomaly': 'The user has Deuteranomaly (green-weakness) and has malfunctioning green cones. Enhance the greens in the image to make them more vibrant and distinct from reds.',
  'Tritanopia': 'The user has Tritanopia (blue-blindness) and has no blue cones. Adjust the image by shifting blues towards distinguishable colors like teals or reds, and increasing contrast with yellows.',
  'Tritanomaly': 'The user has Tritanomaly (blue-weakness) and has malfunctioning blue cones. Enhance the blues and yellows in the image to make them more distinct from each other.'
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

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => !!p.inlineData);

    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data;
        const mimeType: string = imagePart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    
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
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const matchedTask = response.text.trim();
    
    if (availableTasks.includes(matchedTask)) {
      return matchedTask;
    }

    return null;
  } catch (error) {
    console.error("Error finding matching task with AI:", error);
    return null;
  }
}

export async function adjustImageForColorBlindness(
  base64ImageData: string,
  mimeType: string,
  colorBlindnessType: keyof typeof COLOR_BLINDNESS_PROMPTS
): Promise<string> {
  try {
    const promptText = `You are an expert accessibility tool. ${COLOR_BLINDNESS_PROMPTS[colorBlindnessType]}. Do not add, remove, or change any objects in the image. Only perform color correction for accessibility.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType } },
          { text: promptText },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => !!p.inlineData);
    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes: string = imagePart.inlineData.data;
      const responseMimeType: string = imagePart.inlineData.mimeType;
      return `data:${responseMimeType};base64,${base64ImageBytes}`;
    }
    
    throw new Error("No corrected image was found in the AI response.");
  } catch (error) {
    console.error(`Error adjusting image for ${colorBlindnessType}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to adjust image. Details: ${errorMessage}`);
  }
}
