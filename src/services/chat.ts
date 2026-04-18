// We use a local proxy in development (Vite) and a rewrite rule in production (Netlify _redirects).
// This completely bypasses CORS issues.
const TARGET_URL = "/api/nvidia-chat/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[], apiKey: string): Promise<string> {
  const res = await fetch(TARGET_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
