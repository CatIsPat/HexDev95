import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client for image-to-image
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL_NAME = "gemini-2.5-flash-image";

// NVIDIA API Key provided by user
const NVIDIA_API_KEY = "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";

export interface GenerateImageResult {
  imageUrl: string | null;
  text: string | null;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

/**
 * Generates an image from a text prompt using local API proxy to NVIDIA API.
 */
export async function generateImage(prompt: string, aspectRatio: AspectRatio = "1:1"): Promise<GenerateImageResult> {
  try {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        aspectRatio: aspectRatio
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errData.error || `API Error: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.image) {
      // The API returns base64 string directly in data.image
      return {
        imageUrl: `data:image/jpeg;base64,${data.image}`,
        text: null
      };
    }

    return { imageUrl: null, text: null };
  } catch (error) {
    console.error("Error generating image with NVIDIA API:", error);
    throw error;
  }
}

/**
 * Edits an existing image based on a text prompt using Gemini.
 */
export async function editImage(base64Image: string, prompt: string, mimeType: string = "image/png"): Promise<GenerateImageResult> {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
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
    });

    let imageUrl: string | null = null;
    let text: string | null = null;

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
        } else if (part.text) {
          text = part.text;
        }
      }
    }

    return { imageUrl, text };
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
}
