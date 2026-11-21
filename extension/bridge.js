// Task Starter Focus Lock: the bridge
//
// The browser runs this small file inside the Task Starter page only
// (see "content_scripts" in manifest.json). A normal web page can't talk
// to an extension directly, so this file passes messages between them:
//
//   Task Starter page  --window.postMessage-->  this file
//   this file          --chrome.runtime.sendMessage-->  background.js

// 1. Tell the page the extension is installed. app.js listens for this.
window.postMessage({ source: "task-starter-extension", type: "hello" }, window.location.origin);

// 2. Pass "lock" and "unlock" messages from the page to background.js.
window.addEventListener("message", function (event) {
  // Only accept messages the page sent to itself, never from other
  // windows or frames.
  if (event.source !== window) {
    return;
  }
  const data = event.data;
  if (!data || data.source !== "task-starter-page") {
    return;
  }

  // Copy only the fields background.js uses.
  const message = {
    type: data.type,
    allowed: data.allowed,
    endsAt: data.endsAt,
    step: data.step
  };

  // Send it, then tell the page whether the extension accepted it, as
  // "lock-result" or "unlock-result". The page uses this to show
  // "Other websites are paused" only when that is really true.
  try {
    chrome.runtime.sendMessage(message).then(function (answer) {
      tellPage(message.type + "-result", Boolean(answer && answer.ok));
    }).catch(function () {
      tellPage(message.type + "-result", false);
    });
  } catch (error) {
    // The extension was reloaded or removed while this page was open.
    // Reloading the page connects it again.
    tellPage(message.type + "-result", false);
  }
});

function tellPage(type, ok) {
  window.postMessage({ source: "task-starter-extension", type: type, ok: ok }, window.location.origin);
}
