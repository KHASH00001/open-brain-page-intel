function extractPageContent() {
  const title = document.title;
  const url = window.location.href;
  const clone = document.body.cloneNode(true);
  ["script","style","nav","footer","header","aside","iframe","noscript"]
    .forEach(tag => clone.querySelectorAll(tag).forEach(el => el.remove()));
  const text = clone.innerText.replace(/\n{3,}/g, "\n\n").trim().slice(0, 12000);
  return { title, url, text };
}
extractPageContent();
