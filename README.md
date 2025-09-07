# AssistableMe

An AI-powered web application designed to assist users with visual, cognitive, and hearing impairments. This suite leverages the Google Gemini API to provide a set of powerful, on-demand tools in an accessible and user-friendly interface.

![AI Accessibility Suite Screenshot](https://storage.googleapis.com/aistudio-hosting-project-prod.appspot.com/a6fb6315-325b-4375-9e6e-07a840e69ddc/instances/55029054-9a79-4592-8868-e6d8a77a164b/files/Cognitive%20Disability%20-%20Task%20Selection.png)

---

## ✨ Core Features

This application is divided into three main tools:

### 1. 🧠 Cognitive Disability Guide
This tool assists users who may have difficulty with memory, attention, or executive function by breaking down complex tasks into simple, manageable steps.

- **Custom Task Generation:** Users can describe any task (e.g., "how to bake a cake"), and the AI generates a step-by-step guide.
- **Pre-defined Task Library:** A list of common tasks is available for immediate selection.
- **Visual & Auditory Support:** Each step includes a title, a simple description, and an AI-generated photorealistic image. Text-to-speech is available for all text content.
- **Interactive Progress Tracking:** Users can mark steps as complete, earning points and triggering celebratory confetti animations.
- **Task Management:** Users can favorite, delete, and view recently accessed tasks.
- **Voice Navigation:** Control the guide with voice commands like "read step 2," "next step," or "go back."

### 2. 👁️ Visual Impairment Tool
This tool helps users with various forms of color blindness perceive images more clearly.

- **Image Upload:** Users can upload any image from their device.
- **Color Correction Filters:** Select from a range of color vision deficiencies (Protanopia, Deuteranopia, Tritanopia, etc.) and a special "Night Mode" for low-light visibility.
- **AI-Powered Adjustment:** The Gemini vision model analyzes and adjusts the image's colors to enhance differentiability based on the selected condition.
- **AI Image Description:** The AI provides a detailed textual description of the newly corrected image's content and prominent colors.

### 3. 👂 Hearing Impairment Tool
This tool aids in visual communication by converting text or speech into images.

- **Text-to-Image Generation:** Type a description of anything you want to see.
- **Speech-to-Image Generation:** Use your voice to describe an image.
- **Instant Visuals:** The AI generates a high-quality image based on the prompt, providing a quick and effective way to communicate visually.

### Global Accessibility Controls
- **Color Inversion:** A high-contrast mode can be toggled at any time.
- **Brightness Control:** Adjust the brightness of the entire application interface.
- **Universal Text-to-Speech:** "Speak" buttons are available next to most text elements.
- **Global Voice Control:** A persistent button allows for app-wide voice commands where applicable.

---

## 🛠️ Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Engine:** Google Gemini API (`@google/genai`)
  - **`gemini-2.5-flash`:** Used for generating task steps, parsing user intent, and creating structured JSON.
  - **`gemini-2.5-flash-image-preview`:** Used for all image generation and color correction tasks.
- **Browser APIs:**
  - **Web Speech API (`SpeechRecognition`):** For voice command input.
  - **Web Speech API (`SpeechSynthesis`):** For text-to-speech output.

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
- An active [Google AI Studio API key](https://aistudio.google.com/app/apikey).
- The project files from this repository.

### Local Setup
1.  **Environment Variables**: The application is configured to use an API key from `process.env.API_KEY`. You will need to ensure this environment variable is available in your deployment environment. For local development, you might set this up in your shell or via a deployment platform's secret manager.

2.  **Open `index.html`**: This project is built with ES modules and can be run directly in a modern web browser that supports them. Simply open the `index.html` file. For best results, serve the project directory using a simple local server to avoid potential issues with file pathing.

    For example, using Python's built-in server:
    ```bash
    # From the project's root directory
    python3 -m http.server
    ```
    Then, navigate to `http://localhost:8000` in your browser.

---

## 📂 Project Structure

```
/
├── components/          # Reusable React components
│   ├── AccessibilityModeSelection.tsx
│   ├── ColorBlindnessTool.tsx
│   ├── GlobalAccessibilityControls.tsx
│   ├── HearingImpairmentTool.tsx
│   ├── Header.tsx
│   ├── StepCard.tsx
│   ├── TaskGuide.tsx
│   └── TaskSelection.tsx
├── services/            # Modules for external services
│   └── geminiService.ts # All Gemini API calls are centralized here
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component and state management
├── index.html           # The entry point of the web application
├── index.tsx            # React application bootstrap
└── README.md            # This file
```
