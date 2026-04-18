const testPost = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/nvidia-chat/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{role: "user", content: "Hi"}],
        stream: true,
        max_tokens: 10
      })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.log("ERR", e);
  }
}
testPost();
