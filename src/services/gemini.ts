export interface GenerateImageResult {
  imageUrl: string | null;
  text: string | null;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

// ============================================================================
// 🔑 API KEYS SECTION (CLIENT-SIDE)
// Add your NVIDIA API keys here. The app will try them in order.
// ============================================================================
const NVIDIA_API_KEYS = [
  "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", // Key 1
  // "YOUR_SECOND_API_KEY_HERE",
];

// We use a local proxy in development (Vite) and a rewrite rule in production (_redirects).
// This completely bypasses CORS issues without relying on flaky third-party proxies.
const TARGET_URL = "/api/nvidia/genai/stabilityai/stable-diffusion-3-medium";

/**
 * Generates an image from a text prompt directly from the browser using a proxy.
 */
export async function generateImage(prompt: string, aspectRatio: AspectRatio = "1:1"): Promise<GenerateImageResult> {
  let lastError = null;
  let successData = null;

  for (let i = 0; i < NVIDIA_API_KEYS.length; i++) {
    const apiKey = NVIDIA_API_KEYS[i];
    
    try {
      const res = await fetch(TARGET_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          aspect_ratio: aspectRatio
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ Key ${i + 1} failed with status ${res.status}: ${errText}`);
        lastError = { status: res.status, text: errText };
        continue; // Try next key
      }

      successData = await res.json();
      break; // Success! Exit the loop
      
    } catch (fetchError) {
      console.warn(`⚠️ Key ${i + 1} encountered a network error:`, fetchError);
      lastError = { status: 500, text: String(fetchError) };
      continue; // Try next key
    }
  }

  if (successData && successData.image) {
    return {
      imageUrl: `data:image/jpeg;base64,${successData.image}`,
      text: null
    };
  }

  console.error("❌ All API keys failed. Last error:", lastError);
  throw new Error(lastError?.text || "Failed to generate image. All API keys failed or network error.");
}
