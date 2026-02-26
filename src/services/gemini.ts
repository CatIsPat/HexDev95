import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Note: In a real production app, you might want to proxy this through a backend
// if you were using a custom API key, but for this environment, the key is injected safely.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = "gemini-2.5-flash-image";

export interface GenerateImageResult {
  imageUrl: string | null;
  text: string | null;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

/**
 * Generates an image from a text prompt.
 */
export async function generateImage(prompt: string, aspectRatio: AspectRatio = "1:1"): Promise<GenerateImageResult> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    return processResponse(response);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Edits an existing image based on a text prompt.
 */
export async function editImage(base64Image: string, prompt: string, mimeType: string = "image/png"): Promise<GenerateImageResult> {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      // Note: Aspect ratio is typically preserved for edits, but we could pass it if needed.
      // For now, we'll leave it out to respect the original image's dimensions.
    });

    return processResponse(response);
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
}

/**
 * Helper to extract image/text from the response.
 */
function processResponse(response: any): GenerateImageResult {
  let imageUrl: string | null = null;
  let text: string | null = null;

  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        // The model returns raw base64, we need to prefix it for the browser
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
      } else if (part.text) {
        text = part.text;
      }
    }
  }

  return { imageUrl, text };
}
