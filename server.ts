import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

// ============================================================================
// 🔑 API KEYS SECTION
// Add your NVIDIA API keys to this array. The system will try them in order.
// If one fails (e.g., out of credits or rate limited), it will automatically
// fall back to the next key in the list.
// ============================================================================
const NVIDIA_API_KEYS = [
  "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", // Key 1 (Primary)
  // "YOUR_SECOND_API_KEY_HERE", // Key 2 (Uncomment and replace to use)
  // "YOUR_THIRD_API_KEY_HERE",  // Key 3 (Uncomment and replace to use)
  // Add as many keys as you need...
];
// ============================================================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      
      let lastError = null;
      let successData = null;

      // Loop through all available API keys
      for (let i = 0; i < NVIDIA_API_KEYS.length; i++) {
        const apiKey = NVIDIA_API_KEYS[i];
        
        try {
          const nvRes = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium", {
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

          if (!nvRes.ok) {
            const errText = await nvRes.text();
            console.warn(`⚠️ Key ${i + 1} failed with status ${nvRes.status}: ${errText}`);
            lastError = { status: nvRes.status, text: errText };
            continue; // Move to the next key in the loop
          }

          // If we reach here, the request was successful!
          successData = await nvRes.json();
          break; // Exit the loop, we don't need to try any more keys
          
        } catch (fetchError) {
          console.warn(`⚠️ Key ${i + 1} encountered a network error:`, fetchError);
          lastError = { status: 500, text: String(fetchError) };
          continue; // Move to the next key in the loop
        }
      }

      // Check if we got successful data from ANY of the keys
      if (successData) {
        return res.json(successData);
      } else {
        // If the loop finishes and we have no successData, all keys failed
        console.error("❌ All API keys failed. Last error:", lastError);
        return res.status(lastError?.status || 500).json({ 
          error: `All API keys failed. Last error: ${lastError?.text || 'Unknown error'}` 
        });
      }

    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
