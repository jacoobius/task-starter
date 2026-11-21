// Task Starter Focus Lock: the background
//
// This file runs in the background of the browser. While a Task
// Starter timer is counting, it watches each new page the user opens.
// If the page isn't Task Starter or one of the task's saved links, it
// shows blocked.html instead.
//
// Safety rules, so nobody can get stuck:
// - The lock ends by itself when the timer ends, and after 3 hours at most.
// - Closing the Task Starter tab or restarting the browser ends it.
// - blocked.html always has an "Unlock now" button.
// - Pages that were already open are never touched (they might hold
//   unsaved work). Only new page loads are paused.
// Addresses of visited pages are only looked at, never saved or sent.

const MAX_LOCK_MS = 3 * 60 * 60 * 1000;   // 3 hours, in milliseconds

// ==========================================================
// THE SAVED LOCK
// While locked, chrome.storage.local holds one object called "lock":
//   allowed          site names that stay open, e.g. ["docs.google.com"]
//   endsAt           the clock time (in ms) when the timer ends
//   step             the step being worked on, shown on blocked.html
//   starterTabId     the tab Task Starter is in
//   starterWindowId  the window that tab is in
// It is saved (not just kept in a variable) because the browser can
// stop and restart this file at any time to save memory.
// ==========================================================

async function getLock() {
  const data = await chrome.storage.local.get("lock");
  return data.lock || null;
}

async function setLock(lock) {
  await chrome.storage.local.set({ lock: lock });
}

async function clearLock() {
  await chrome.storage.local.remove("lock");
  await chrome.alarms.clear("unlock");
}

// Returns the lock if one is running, or null. A lock whose time has
// passed is cleared here, so an old lock can never hang around.
async function currentLock() {
  const lock = await getLock();
  if (lock && Date.now() > lock.endsAt) {
    await clearLock();
    return null;
  }
  return lock;
}

// ==========================================================
// CHECKING SITES
// ==========================================================

// Is this site name allowed? "docs.google.com" also allows its
// sub-sites, like "www.docs.google.com".
function isAllowed(hostname, allowed) {
  return allowed.some(function (site) {
    return hostname === site || hostname.endsWith("." + site);
  });
}

// Tidy a site name sent by the page. Returns "" if it isn't a
// plain site name (only letters, numbers, dots and dashes).
function cleanSiteName(text) {
  if (typeof text !== "string") {
    return "";
  }
  const name = text.trim().toLowerCase();
  if (name.length === 0 || name.length > 253 || !/^[a-z0-9.-]+$/.test(name)) {
    return "";
  }
  return name;
}

// Is this the Task Starter website (the live site or the local copy)?
function isStarterPage(address) {
  try {
    const url = new URL(address);
    const isLive = url.href.startsWith("https://jacoobius.github.io/task-starter/");
    const isLocal = url.protocol === "http:" && url.hostname === "localhost";
    return isLive || isLocal;
  } catch (error) {
    return false;
  }
}

// Is this message from our own blocked.html page?
function isBlockedPage(address) {
  return typeof address === "string" && address.startsWith(chrome.runtime.getURL("blocked.html"));
}

// ==========================================================
// PAUSING PAGES
// Pages can arrive in a tab in more than one way, so three events are
// watched. Each one calls checkPage().
// ==========================================================

// Decide about one page in one tab, and show blocked.html instead if
// it isn't allowed right now.
async function checkPage(tabId, address) {
  const lock = await currentLock();
  if (!lock) {
    return;
  }

  let url;
  try {
    url = new URL(address);
  } catch (error) {
    return;
  }

  // Only ordinary websites. Browser pages (settings, the new-tab page,
  // this extension's own pages) are always left alone.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }
  if (isAllowed(url.hostname, lock.allowed)) {
    return;
  }

  // Show the "paused" page in this tab instead. The site name and the
  // full address go along, so blocked.html can offer to allow it.
  const page = chrome.runtime.getURL("blocked.html") +
    "?site=" + encodeURIComponent(url.hostname) +
    "&from=" + encodeURIComponent(address);
  try {
    await chrome.tabs.update(tabId, { url: page });
  } catch (error) {
    // The tab has gone (closed, or replaced while this was running).
  }
}

// Is this event about a whole page in a tab the user can see?
// frameId 0 = the page itself, not a frame inside it. A "prerender" is
// a hidden copy Chrome loads early while you type an address; it is
// not a real tab yet, so it is checked when it is swapped in (below).
function isVisiblePage(details) {
  return details.frameId === 0 && details.tabId >= 0 &&
    details.documentLifecycle !== "prerender";
}

// 1. Just before a tab starts loading a page: the quickest check.
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (isVisiblePage(details)) {
    checkPage(details.tabId, details.url);
  }
});

// 2. When a page has actually arrived in a tab. This catches what the
// first check can miss: redirects to another site, and pages brought
// back with the Back and Forward buttons.
chrome.webNavigation.onCommitted.addListener(function (details) {
  if (isVisiblePage(details)) {
    checkPage(details.tabId, details.url);
  }
});

// 3. When Chrome swaps a preloaded (prerendered) page into a tab, for
// example after typing an address into a new tab and pressing Enter.
// No loading event happens then, so ask what the tab now shows.
chrome.webNavigation.onTabReplaced.addListener(async function (details) {
  try {
    const frame = await chrome.webNavigation.getFrame({ tabId: details.tabId, frameId: 0 });
    if (frame) {
      checkPage(details.tabId, frame.url);
    }
  } catch (error) {
    // The tab has already gone.
  }
});

// ==========================================================
// MESSAGES
// From the Task Starter page (through bridge.js) and from blocked.html.
// ==========================================================
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  handleMessage(message, sender).then(sendResponse);
  return true;   // tells Chrome the answer will come later (async)
});

async function handleMessage(message, sender) {
  if (!message || typeof message.type !== "string") {
    return { ok: false };
  }

  const fromStarter = Boolean(sender.tab) && isStarterPage(sender.url);
  const fromBlockedPage = isBlockedPage(sender.url);

  // The timer started (or resumed): lock until it ends.
  if (message.type === "lock" && fromStarter) {
    const endsAt = Math.min(Number(message.endsAt), Date.now() + MAX_LOCK_MS);
    if (!(endsAt > Date.now())) {
      return { ok: false };   // not a sensible time
    }

    const sent = Array.isArray(message.allowed) ? message.allowed : [];
    const allowed = sent.map(cleanSiteName).filter(function (name) {
      return name !== "";
    });
    allowed.push(new URL(sender.url).hostname);   // Task Starter itself always stays open

    await setLock({
      allowed: allowed,
      endsAt: endsAt,
      step: String(message.step || "").slice(0, 120),
      starterTabId: sender.tab.id,
      starterWindowId: sender.tab.windowId
    });

    // A backup in case nobody sends "unlock": end the lock 2 seconds
    // after the timer ends.
    chrome.alarms.create("unlock", { when: endsAt + 2000 });
    return { ok: true };
  }

  // The timer stopped, or the user pressed "Unlock now".
  if (message.type === "unlock" && (fromStarter || fromBlockedPage)) {
    await clearLock();
    return { ok: true };
  }

  // blocked.html asks what is going on, to show the time left.
  if (message.type === "get-lock" && fromBlockedPage) {
    return { ok: true, lock: await currentLock() };
  }

  // "Allow this site for this timer" on blocked.html.
  if (message.type === "allow-site" && fromBlockedPage) {
    const lock = await currentLock();
    const site = cleanSiteName(message.site);
    if (lock && site !== "") {
      lock.allowed.push(site);
      await setLock(lock);
    }
    return { ok: true };
  }

  // "Back to Task Starter" on blocked.html: switch to that tab.
  if (message.type === "back-to-starter" && fromBlockedPage) {
    const lock = await currentLock();
    if (!lock) {
      return { ok: false };
    }
    try {
      await chrome.tabs.update(lock.starterTabId, { active: true });
      await chrome.windows.update(lock.starterWindowId, { focused: true });
      return { ok: true };
    } catch (error) {
      // The Task Starter tab is gone, so there is nothing to focus on.
      await clearLock();
      return { ok: false };
    }
  }

  return { ok: false };
}

// ==========================================================
// THE WAYS A LOCK ENDS BY ITSELF
// ==========================================================

// The backup alarm set when the lock started.
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "unlock") {
    clearLock();
  }
});

// The Task Starter tab was closed.
chrome.tabs.onRemoved.addListener(async function (tabId) {
  const lock = await getLock();
  if (lock && lock.starterTabId === tabId) {
    await clearLock();
  }
});

// The browser was restarted.
chrome.runtime.onStartup.addListener(function () {
  clearLock();
});
