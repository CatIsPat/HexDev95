const testStreamProxy = async () => {
  const apiKey = "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";
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{role: "user", content: "Hi"}],
      stream: true,
      max_tokens: 10
    })
  });
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log("CHUNK:", decoder.decode(value));
  }
}
testStreamProxy();
