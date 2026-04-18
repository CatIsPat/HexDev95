// We now use a robust backend Express endpoint to flush Server-Sent Events natively 
// which avoids Vite proxy buffering issues that cause timeouts and freezing.
const TARGET_URL = "/api/chat";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamChatMessage(messages: ChatMessage[], apiKey: string, signal?: AbortSignal): AsyncGenerator<string, void, unknown> {
  const res = await fetch(TARGET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream"
    },
    body: JSON.stringify({
      messages: messages
    }),
    signal
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data: ')) continue;
        if (trimmedLine === 'data: [DONE]') return;
        
        try {
          const data = JSON.parse(trimmedLine.slice(6));
          if (data.choices && data.choices[0].delta?.content) {
            yield data.choices[0].delta.content;
          }
        } catch (e) {
          // Ignore partial JSON parsing errors
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
