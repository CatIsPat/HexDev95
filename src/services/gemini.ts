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

