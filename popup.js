document.getElementById("analyze").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const summary = document.getElementById("summary");
  status.textContent = "Extracting page content...";
  summary.textContent = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject content script and get page data
    const [{ result: pageData }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const title = document.title;
        const url = window.location.href;
        const clone = document.body.cloneNode(true);
        ["script","style","nav","footer","header","aside","iframe","noscript"]
          .forEach(tag => clone.querySelectorAll(tag).forEach(el => el.remove()));
        const text = clone.innerText.replace(/\n{3,}/g, "\n\n").trim().slice(0, 12000);
        return { title, url, text };
      }
    });

    status.textContent = "Analyzing with Claude...";

    // Send to background for Claude analysis
    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE",
      payload: pageData
    });

    if (response.error) {
      status.textContent = "Error";
      summary.textContent = response.error;
    } else {
      status.textContent = "Done!";
      summary.textContent = response.result;
    }
  } catch (err) {
    status.textContent = "Error";
    summary.textContent = err.message;
  }
});
