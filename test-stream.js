import { streamChatMessage } from './src/services/chat.js';

async function test() {
  try {
    const stream = streamChatMessage([{role: "user", content: "Hi"}], "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");
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
