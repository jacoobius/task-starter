// Task Starter Focus Lock: the "paused" page
//
// background.js sends a tab here instead of a site that isn't allowed
// during the timer. The address looks like:
//   blocked.html?site=www.youtube.com&from=https%3A%2F%2Fwww.youtube.com%2F
// "site" is the site's name; "from" is the full address the user wanted.

const params = new URLSearchParams(window.location.search);
const site = params.get("site") || "this site";
const from = params.get("from") || "";

// Only ever send the user on to an ordinary web address.
function isWebAddress(address) {
  return address.startsWith("https://") || address.startsWith("http://");
}

// Ask background.js something and wait for the answer.
function ask(message) {
  return chrome.runtime.sendMessage(message);
}

// Milliseconds as "9:05".
function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}

// Go on to the site the user wanted (or back, if there's no address).
function goToSite() {
  if (isWebAddress(from)) {
    window.location.href = from;
  } else {
    history.back();
  }
}

document.getElementById("allow").textContent = "Allow " + site + " for this timer";
document.getElementById("go").textContent = "Go to " + site;

// Redraw the page from the current lock. Runs every second.
async function update() {
  const answer = await ask({ type: "get-lock" });
  const lock = answer && answer.lock;

  if (!lock) {
    // The timer has ended (or was unlocked). Nothing is paused now.
    document.getElementById("heading").textContent = "Your timer has ended";
    document.getElementById("message").textContent = "Nothing is paused any more. " + site + " is open again.";
    document.getElementById("step").hidden = true;
    document.getElementById("locked-buttons").hidden = true;
    document.getElementById("free-buttons").hidden = false;
    clearInterval(timer);
    return;
  }

  document.getElementById("message").textContent =
    site + " is paused until your timer ends, in " + formatTime(lock.endsAt - Date.now()) + ".";

  if (lock.step !== "") {
    document.getElementById("step").textContent = "You're on: " + lock.step;
    document.getElementById("step").hidden = false;
  }
}

const timer = setInterval(update, 1000);
update();

document.getElementById("back").addEventListener("click", async function () {
  const answer = await ask({ type: "back-to-starter" });
  if (!answer || !answer.ok) {
    // Task Starter's tab is gone, and the lock with it.
    update();
  }
});

document.getElementById("allow").addEventListener("click", async function () {
  await ask({ type: "allow-site", site: site });
  goToSite();
});

document.getElementById("unlock").addEventListener("click", async function () {
  await ask({ type: "unlock" });
  goToSite();
});

document.getElementById("go").addEventListener("click", goToSite);

// Start with keyboard and screen-reader focus on the heading.
document.getElementById("heading").focus();
