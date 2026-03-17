chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ANALYZE") {
    analyzeWithClaude(msg.payload).then(sendResponse).catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function analyzeWithClaude({ title, url, text, instruction }) {
  const system = `You are a sharp research assistant for Mohammed, CEO of MOSAIK Technology — a real estate tokenization startup in Dubai pursuing VARA licensing. Extract only what matters. Flag anything relevant to: real estate, tokenization, VARA/FSRA regulation, XRPL, fintech, UAE market, competitive landscape, or fundraising.

Format your response as:
## [Page Title]
**Source:** [URL]

### Key Takeaways
[3-5 bullet points]

### MOSAIK Relevance
[1-2 sentences — or "Not directly relevant"]

### Raw Notes
[Specific quotes, data, or details worth preserving]`;

  const userMsg = instruction
    ? `Page: "${title}"
URL: ${url}

Focus: ${instruction}

Content:
${text}`
    : `Page: "${title}"
URL: ${url}

Content:
${text}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "ANTHROPIC_API_KEY_PLACEHOLDER",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userMsg }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return { result: data.content[0].text, title, url };
}
