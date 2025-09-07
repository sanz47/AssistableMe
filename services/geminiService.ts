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
  'Tritanomaly': 'The user has Tritanomaly (blue-weakness) and has malfunctioning blue cones. Enhance the blues and yellows in the image to make them more distinct from each other.',
  'Nyctalopia': 'The user has Nyctalopia (night blindness) and has difficulty seeing in low light. Adjust the image to enhance visibility in dark areas by increasing brightness, contrast, and clarifying details in shadows without overexposing the bright parts of the image.'
};

export async function generateTaskSteps(taskName: string): Promise<TaskStep[]> {
  try {
    const prompt = `You are an AI assistant specializing in instructional design for cognitive accessibility. Your mission is to break down complex tasks into simple, clear, and manageable steps for users who may have difficulty with memory, attention, or executive function. Your tone should be encouraging, simple, and direct.

For the task "${taskName}", create exactly 7 sequential steps. Each step MUST be distinct and build upon the last one.

For each step, provide the following in JSON format:
1.  **title**: A very short, clear, and direct action phrase (e.g., "Get the soap").
2.  **description**: A simple, one or two-sentence explanation of the step. Avoid jargon and complex sentences. Write as if you are explaining it to a 10-year-old.
3.  **image_prompt**: A highly detailed, photorealistic prompt for an AI image generator. This prompt must visualize the action of the step clearly. Describe the scene from a first-person perspective where possible. The image should be simple, with a clean background to avoid distractions.

Example for "Washing hands":
- title: "Wet your hands"
- description: "Turn on the water tap. Put your hands under the running water to get them wet."
- image_prompt: "Photorealistic image of a person's hands under a stream of clear water from a chrome faucet. First-person point of view. A white sink is visible in the background."

Generate the list of 7 steps for the task: "${taskName}". Respond ONLY with the JSON array.`;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
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

export async function generateImage(prompt: string, isSimplified: boolean = false): Promise<string> {
  try {
    let finalPrompt = `${prompt}, ultra realistic, high detail, 8k`;
    if (isSimplified) {
      finalPrompt = `${prompt}, in a simple, minimalist art style with a calming and muted color palette, using soft and non-triggering colors like pastels. Avoid harsh contrasts or overly stimulating visual details.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview', // Using nano-banana model as requested by user
        contents: finalPrompt,
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

export async function findMatchingOption(transcript: string, options: string[]): Promise<string | null> {
  try {
    const prompt = `From the following list of options, which one is the best and most direct match for the user's request: "${transcript}"?

    Options List:
    - ${options.join('\n- ')}

    Analyze the user's intent. If the request directly corresponds to one of the options, respond with ONLY the single, exact option name from the list. If the user's request is ambiguous or doesn't match any option well, respond with the word "None".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const matchedOption = response.text.trim();
    
    if (options.includes(matchedOption)) {
      return matchedOption;
    }

    return null;
  } catch (error) {
    console.error("Error finding matching option with AI:", error);
    return null;
  }
}

export async function parseCustomTask(transcript: string): Promise<string | null> {
    const prefixes = ["create a guide for", "create a new guide for", "make a guide for", "how to", "generate a guide for"];
    const transcriptLower = transcript.toLowerCase();
    
    if (!prefixes.some(p => transcriptLower.startsWith(p))) {
        return null;
    }

    try {
        const prompt = `The user said: "${transcript}". Extract the core task they want a guide for. For example, if they said "Create a guide for how to bake a chocolate cake", respond with "Bake a chocolate cake". Respond with ONLY the concise task name.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0,
            thinkingConfig: { thinkingBudget: 0 }
          }
        });

        const task = response.text.trim();
        return task || null;

    } catch (error) {
        console.error("Error parsing custom task with AI:", error);
        return null;
    }
}


export async function adjustImageForColorBlindness(
  base64ImageData: string,
  mimeType: string,
  colorBlindnessType: keyof typeof COLOR_BLINDNESS_PROMPTS
): Promise<{ correctedImage: string; description: string }> {
  try {
    const promptText = `You are an expert accessibility tool. Your task is to perform two actions:
1.  **Color Correction:** ${COLOR_BLINDNESS_PROMPTS[colorBlindnessType]}. Do not add, remove, or change any objects in the image. The primary goal is color correction for accessibility.
2.  **Image Description:** After correcting the image, provide a detailed textual description of the image's content. Describe the main subject, background, and any important actions or details. Also, list the prominent colors visible in the newly corrected image. Your description should be clear and concise.`;
    
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
    
    let correctedImage: string | null = null;
    let description: string | null = null;
    
    response.candidates?.[0]?.content?.parts.forEach(part => {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const responseMimeType: string = part.inlineData.mimeType;
            correctedImage = `data:${responseMimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
            description = part.text;
        }
    });

    if (correctedImage && description) {
        return { correctedImage, description };
    }
    
    throw new Error("The AI response did not include both a corrected image and a description.");

  } catch (error) {
    console.error(`Error adjusting image for ${colorBlindnessType}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to adjust image. Details: ${errorMessage}`);
  }
}