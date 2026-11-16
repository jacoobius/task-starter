// Task Starter
// Plain JavaScript, no libraries. The file is split into sections,
// one per screen, in the same order as the screens in index.html.

// ==========================================================
// STATE
// Everything the app needs to remember lives in this one object.
// ==========================================================
const state = {
  task: "",           // the task the user is avoiding
  steps: [],          // the steps, in order. Each is { id, text, done }
  nextStepId: 1,      // id to give the next new step, so every id is unique
  timerMinutes: 10,   // the timer length the user last chose
  settings: {
    sound: true,      // play the chime
    animation: true,  // animate the check mark
    rewards: true,    // show the companion, XP, badges, check mark and kind message
    plainMode: false, // true = all three above count as off
    focusLock: true   // ask before leaving a running timer
  },
  links: [],          // web addresses for the current task, e.g. the assignment page

  // Rewards (see rewards.js). These only ever go up.
  pet: "cat",         // which animal the user chose (an id from pets.js)
  xp: 0,              // total XP earned
  badges: [],         // ids of the badges earned so far
  finishedTasks: [],  // tasks completed. Each is { text, steps, date }
  taskLogged: false,  // true once the current task is in finishedTasks
  stats: {
    stepsDone: 0,       // steps finished, ever
    minutesFocused: 0,  // minutes the timer has run, ever
    tasksDone: 0,       // whole tasks finished, ever
    daysActive: []      // each day the app was used, e.g. "2026-11-16"
  }
};

// ==========================================================
// SAVING
// The state object is saved in the browser's localStorage as text
// (JSON), so the task and steps are still there after a reload.
// ==========================================================
const STORAGE_KEY = "task-starter";

// Call this after every change to "state".
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Storage can be blocked or full (e.g. private browsing). The app
    // still works; it just won't remember things after a reload.
  }
}

// Copy any saved values into "state". Runs once, when the page opens.
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      // "settings" and "stats" are objects inside state, so copy their
      // values one level down. Copying them whole would replace our
      // defaults and lose anything that was added after the user last
      // saved.
      Object.assign(state.settings, saved.settings);
      delete saved.settings;
      Object.assign(state.stats, saved.stats);
      delete saved.stats;

      Object.assign(state, saved);

      // Links can also arrive from a backup file, so check each one
      // again and drop anything that is not an ordinary web address.
      state.links = state.links.map(cleanLink).filter(function (link) {
        return link !== null;
      });
    }
  } catch (error) {
    // Nothing saved yet, or the saved text is damaged: start fresh.
  }
}

// ==========================================================
// HELPERS
// ==========================================================

// Speak a short message to screen-reader users. It writes the text into
// the invisible #status element, which screen readers read out.
function announce(message) {
  const status = document.getElementById("status");

  // Empty it first, then add the text a moment later. Screen readers
  // only speak when the text changes, so without this the same message
  // twice in a row ("Step deleted." twice) would be silent the second time.
  status.textContent = "";
  setTimeout(function () {
    status.textContent = message;
  }, 50);
}

// ==========================================================
// SCREENS
// ==========================================================

// The ids of the screens in index.html.
const SCREEN_IDS = ["screen-task", "screen-steps", "screen-timer", "screen-done", "screen-pet"];

// The screen that is showing right now.
let currentScreenId = "screen-task";

// Show one screen and hide the others.
// Example: showScreen("screen-steps")
function showScreen(screenId) {
  for (const id of SCREEN_IDS) {
    const screen = document.getElementById(id);
    screen.hidden = (id !== screenId);
  }
  currentScreenId = screenId;

  // Move keyboard and screen-reader focus to the new screen's heading,
  // so users know the screen changed.
  const heading = document.querySelector("#" + screenId + " h1");
  heading.focus();
}

// ==========================================================
// SCREEN 1: THE TASK
// ==========================================================
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");

// When the form is submitted (button click or Enter key), remember the
// task and move on to the steps screen.
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the browser from reloading the page

  const text = taskInput.value.trim();
  if (text === "") {
    // Only spaces were typed. Put the cursor back in the box.
    taskInput.value = "";
    taskInput.focus();
    return;
  }

  state.task = text;
  saveState();
  openStepsScreen();
});

// ==========================================================
// SCREEN 2: THE STEPS
// ==========================================================

function openStepsScreen() {
  renderSteps();
  showScreen("screen-steps");
}

// "Change task" goes back to screen 1 with the current task filled in.
document.getElementById("change-task").addEventListener("click", function () {
  taskInput.value = state.task;
  showScreen("screen-task");
});

// The id of the step being edited right now, or null if none is.
let editingStepId = null;

// Find one step in state.steps by its id.
function findStep(stepId) {
  return state.steps.find(function (step) {
    return step.id === stepId;
  });
}

// Redraw the steps screen so it matches what is in "state".
// The list is emptied and rebuilt every time, which keeps the code
// simple: change the data, then call renderSteps().
function renderSteps() {
  document.getElementById("steps-task-name").textContent = state.task;

  const list = document.getElementById("step-list");
  list.innerHTML = "";

  state.steps.forEach(function (step, index) {
    const item = document.createElement("li");
    item.className = "step";
    item.dataset.stepId = step.id;   // lets us find this row again later

    if (step.id === editingStepId) {
      item.append(buildStepEditor(step));
    } else {
      item.append(buildStepRow(step, index));
    }

    list.append(item);
  });

  // The ready-made first steps are only offered while the list is empty.
  document.getElementById("step-ideas").hidden = (state.steps.length > 0);

  // Show progress, e.g. "3 of 5 steps done", once there are steps.
  const progress = document.getElementById("steps-progress");
  progress.textContent = progressText();
  progress.hidden = (state.steps.length === 0);

  // The main button starts the first step that isn't done yet.
  // It is hidden when there is no such step.
  const startButton = document.getElementById("start-step");
  const step = nextStep();
  if (step) {
    startButton.textContent = "Start: " + step.text;
    startButton.hidden = false;
  } else {
    startButton.hidden = true;
  }

  renderLinks();
}

// The first step that isn't done yet (or undefined if there is none).
function nextStep() {
  return state.steps.find(function (step) {
    return !step.done;
  });
}

document.getElementById("start-step").addEventListener("click", function () {
  openTimerScreen(nextStep().id);
});

// Call this after any change to the steps: save, redraw the list and
// tell screen-reader users what happened.
function stepsChanged(message) {
  saveState();
  renderSteps();
  announce(message);
}

// Build the normal view of one step: its text and four buttons.
function buildStepRow(step, index) {
  const row = document.createElement("div");
  row.className = "step-row";

  const text = document.createElement("span");
  text.className = "step-text";
  text.textContent = step.text;

  // A finished step gets a small "Done" label after its text.
  if (step.done) {
    const mark = document.createElement("span");
    mark.className = "step-mark";
    mark.textContent = "Done";
    text.append(mark);
  }

  const editButton = makeStepButton("Edit", "Edit", "edit", step);
  const upButton = makeStepButton("Up", "Move up", "up", step);
  const downButton = makeStepButton("Down", "Move down", "down", step);
  const deleteButton = makeStepButton("Delete", "Delete", "delete", step);

  // The first step can't move up and the last can't move down.
  upButton.disabled = (index === 0);
  downButton.disabled = (index === state.steps.length - 1);

  editButton.addEventListener("click", function () {
    editingStepId = step.id;
    renderSteps();
    document.querySelector(".step-edit-input").focus();
  });

  upButton.addEventListener("click", function () {
    moveStep(step.id, -1);
    focusStepButton(step.id, "up");
  });

  downButton.addEventListener("click", function () {
    moveStep(step.id, 1);
    focusStepButton(step.id, "down");
  });

  deleteButton.addEventListener("click", function () {
    deleteStep(step.id);
  });

  // Keep the four buttons in one group, so on a narrow screen they all
  // wrap to the next line together.
  const buttons = document.createElement("div");
  buttons.className = "step-buttons";
  buttons.append(editButton, upButton, downButton, deleteButton);

  row.append(text, buttons);
  return row;
}

// Make one of the small buttons beside a step.
// "label" is the visible text. "longLabel" plus the step text is what a
// screen reader says, e.g. "Move up: Open laptop", so buttons on
// different rows don't all sound the same.
function makeStepButton(label, longLabel, action, step) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button-small";
  button.textContent = label;
  button.setAttribute("aria-label", longLabel + ": " + step.text);
  button.dataset.action = action;   // lets focusStepButton() find it
  return button;
}

// Build the editing view of one step: a text box with Save and Cancel.
function buildStepEditor(step) {
  const form = document.createElement("form");
  form.className = "step-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "step-edit-input";
  input.value = step.text;
  input.maxLength = 120;
  input.setAttribute("aria-label", "Edit step");

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "button button-small";
  saveButton.textContent = "Save";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "button button-small";
  cancelButton.textContent = "Cancel";

  function cancelEditing() {
    editingStepId = null;
    renderSteps();
    focusStepButton(step.id, "edit");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = input.value.trim();
    if (text === "") {
      input.focus();
      return;
    }

    step.text = text;
    editingStepId = null;
    stepsChanged("Step saved.");
    focusStepButton(step.id, "edit");
  });

  cancelButton.addEventListener("click", cancelEditing);

  // Pressing Escape in the text box also cancels.
  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      cancelEditing();
    }
  });

  form.append(input, saveButton, cancelButton);
  return form;
}

// Redrawing the list throws away the button that had keyboard focus.
// This puts focus back on the matching button in the redrawn list, so
// keyboard users don't lose their place.
function focusStepButton(stepId, action) {
  const row = document.querySelector('[data-step-id="' + stepId + '"]');
  let button = row.querySelector('[data-action="' + action + '"]');

  // A disabled button can't take focus (e.g. "Up" once a step reaches
  // the top), so fall back to that row's Edit button.
  if (button.disabled) {
    button = row.querySelector('[data-action="edit"]');
  }
  button.focus();
}

// Move a step one place. direction is -1 for up, 1 for down.
function moveStep(stepId, direction) {
  const from = state.steps.findIndex(function (step) {
    return step.id === stepId;
  });
  const to = from + direction;

  if (to < 0 || to >= state.steps.length) {
    return;   // already at the top or bottom
  }

  // Take the step out of the list, then put it back one place over.
  const step = state.steps.splice(from, 1)[0];
  state.steps.splice(to, 0, step);

  stepsChanged("Step moved. It is now number " + (to + 1) + " of " + state.steps.length + ".");
}

function deleteStep(stepId) {
  state.steps = state.steps.filter(function (step) {
    return step.id !== stepId;
  });

  stepsChanged("Step deleted.");
  stepInput.focus();
}

// Adding a step: the form under the task name.
const stepForm = document.getElementById("step-form");
const stepInput = document.getElementById("step-input");

stepForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = stepInput.value.trim();
  if (text === "") {
    stepInput.focus();
    return;
  }

  stepInput.value = "";
  addStep(text);
});

// Add one step to the end of the list.
function addStep(text) {
  state.steps.push({ id: state.nextStepId, text: text, done: false });
  state.nextStepId = state.nextStepId + 1;

  // Keep the cursor in the box, ready for the next step.
  stepInput.focus();
  stepsChanged("Step added: " + text);
}

// Ready-made first steps. Starting is the hard part, and an empty list
// can make it harder, so these give the user something to click.
const STEP_IDEAS = [
  "Open the assignment",
  "Read the instructions once",
  "Write one messy sentence"
];

// Make one button per idea. Clicking it adds that step.
for (const idea of STEP_IDEAS) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button-small";
  button.textContent = idea;

  button.addEventListener("click", function () {
    addStep(idea);
  });

  document.getElementById("step-idea-buttons").append(button);
}

// ----- Links for the task -----
// The user can save the web address of their assignment. The links are
// shown as buttons beside the timer, so the right page is one click
// away and there is no need to go looking for it (and get distracted).

const linkForm = document.getElementById("link-form");
const linkInput = document.getElementById("link-input");

// Tidy up what the user typed into a full web address.
// Returns null if it can't be read as one.
function cleanLink(text) {
  let address = text.trim();
  if (address === "") {
    return null;
  }

  // People often leave off the "https://" at the front. Add it. This
  // also guarantees the link can only ever be an ordinary web page.
  if (!address.startsWith("http://") && !address.startsWith("https://")) {
    address = "https://" + address;
  }

  // A web address has no spaces in it.
  if (address.includes(" ")) {
    return null;
  }

  // new URL() checks the address and throws an error if it is nonsense.
  // We also expect a dot in the site name, as in "docs.google.com".
  try {
    const url = new URL(address);
    if (!url.hostname.includes(".")) {
      return null;
    }
    return url.href;
  } catch (error) {
    return null;
  }
}

linkForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const link = cleanLink(linkInput.value);
  if (link === null) {
    announce("That doesn't look like a web address. Try pasting it again.");
    linkInput.focus();
    return;
  }

  state.links.push(link);
  saveState();
  linkInput.value = "";
  linkInput.focus();
  renderLinks();
  announce("Link added.");
});

// Redraw the list of saved links on the steps screen.
function renderLinks() {
  const list = document.getElementById("link-list");
  list.innerHTML = "";

  state.links.forEach(function (link, index) {
    const item = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = link;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "button button-small";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove link: " + link);

    removeButton.addEventListener("click", function () {
      state.links.splice(index, 1);   // take this one link out of the list
      saveState();
      renderLinks();
      announce("Link removed.");
      linkInput.focus();
    });

    item.append(text, removeButton);
    list.append(item);
  });
}

// ==========================================================
// SCREEN 3: THE TIMER
// The screen has two parts. Part A asks how many minutes. Part B is
// the countdown. Only one part is visible at a time.
// ==========================================================
const APP_TITLE = "Task Starter";

const timerSetup = document.getElementById("timer-setup");
const timerRunning = document.getElementById("timer-running");
const timerMinutesInput = document.getElementById("timer-minutes");
const timerDisplay = document.getElementById("timer-display");
const timerMessage = document.getElementById("timer-message");
const timerPauseButton = document.getElementById("timer-pause");
const timerMoreButton = document.getElementById("timer-more");

let currentStepId = null;   // the step being worked on
let timerEndTime = 0;       // the clock time (in ms) when the countdown hits zero
let timerRemainingMs = 0;   // how much time is left, in milliseconds
let timerInterval = null;   // the repeating "tick", or null when not counting

// For XP: how long the timer has really run on this step.
let countdownLengthMs = 0;  // the part of the current countdown not yet counted
let focusedMs = 0;          // time counted so far on this step

// Add the time that has run since the last count to focusedMs.
// Safe to call more than once: the second call finds nothing new to add.
function countFocusTime() {
  focusedMs = focusedMs + (countdownLengthMs - timerRemainingMs);
  countdownLengthMs = timerRemainingMs;
}

// Open the timer screen for one step, showing part A.
function openTimerScreen(stepId) {
  stopTicking();
  currentStepId = stepId;
  focusedMs = 0;
  countdownLengthMs = 0;
  timerRemainingMs = 0;
  document.getElementById("steps-notice").hidden = true;

  document.getElementById("timer-step-name").textContent = findStep(stepId).text;
  timerMinutesInput.value = state.timerMinutes;
  timerSetup.hidden = false;
  timerRunning.hidden = true;

  // One "Open ..." button per saved link. Each opens in a new tab.
  const linkButtons = document.getElementById("timer-link-buttons");
  linkButtons.innerHTML = "";

  for (const link of state.links) {
    const anchor = document.createElement("a");
    anchor.className = "button";
    anchor.href = link;
    anchor.target = "_blank";            // open in a new tab
    anchor.rel = "noopener noreferrer";  // the new page can't reach back into this one
    anchor.textContent = "Open " + new URL(link).hostname;   // e.g. "Open docs.google.com"
    linkButtons.append(anchor);
  }
  document.getElementById("timer-links").hidden = (state.links.length === 0);

  showScreen("screen-timer");
}

// Part A: the user chose a length and pressed "Start timer".
timerSetup.addEventListener("submit", function (event) {
  event.preventDefault();

  const minutes = Number(timerMinutesInput.value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
    announce("Please choose a whole number of minutes between 1 and 120.");
    timerMinutesInput.focus();
    return;
  }

  // Remember the choice so it is the default next time.
  state.timerMinutes = minutes;
  saveState();

  startCountdown();
  announce("Timer started: " + minutes + " minutes.");
});

// Switch to part B and start counting down from state.timerMinutes.
function startCountdown() {
  timerRemainingMs = state.timerMinutes * 60 * 1000;
  countdownLengthMs = timerRemainingMs;

  timerSetup.hidden = true;
  timerRunning.hidden = false;
  timerMessage.textContent = "";
  timerPauseButton.hidden = false;
  timerPauseButton.textContent = "Pause";
  timerMoreButton.hidden = true;

  startTicking();
  timerPauseButton.focus();
}

// Start (or resume) counting down from timerRemainingMs.
// We work out the clock time when the timer should end, then check the
// clock four times a second. Comparing against the real clock keeps the
// timer accurate even if the browser slows the page down in a
// background tab.
function startTicking() {
  timerEndTime = Date.now() + timerRemainingMs;
  timerInterval = setInterval(tick, 250);
  tick();
}

function stopTicking() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Runs four times a second while the timer is counting.
function tick() {
  timerRemainingMs = Math.max(0, timerEndTime - Date.now());
  showTime(timerRemainingMs);

  if (timerRemainingMs === 0) {
    timeIsUp();
  }
}

// Show milliseconds as minutes:seconds, e.g. 9:05.
// The time also goes in the browser tab title, so it stays visible
// when the user is looking at another tab.
function showTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const text = minutes + ":" + String(seconds).padStart(2, "0");

  timerDisplay.textContent = text;
  document.title = text + " - " + APP_TITLE;
}

// The countdown reached zero. Nothing is forced: the user decides
// whether the step is finished or they want more time.
function timeIsUp() {
  stopTicking();
  countFocusTime();
  timerMessage.textContent = "Time's up. Finished, or want a bit longer?";

  // The Pause button is about to disappear. If it has keyboard focus,
  // move focus to a button that stays.
  if (document.activeElement === timerPauseButton) {
    document.getElementById("timer-done").focus();
  }
  timerPauseButton.hidden = true;
  timerMoreButton.hidden = false;
  announce("Time's up.");
  playChime();
}

timerPauseButton.addEventListener("click", function () {
  if (timerInterval !== null) {
    stopTicking();
    timerPauseButton.textContent = "Resume";
    announce("Timer paused.");
  } else {
    startTicking();
    timerPauseButton.textContent = "Pause";
    announce("Timer resumed.");
  }
});

// "Add more time" runs the same length again.
timerMoreButton.addEventListener("click", function () {
  startCountdown();
  announce("Timer started again: " + state.timerMinutes + " minutes.");
});

// Stop the timer and put the tab title back to normal.
// Returns how many full minutes the timer ran on this step.
function leaveTimer() {
  stopTicking();
  countFocusTime();
  document.title = APP_TITLE;

  const minutes = Math.floor(focusedMs / 60000);   // 60000 ms = 1 minute
  focusedMs = 0;
  return minutes;
}

// "I finished this step" works at any time, not only when time is up.
document.getElementById("timer-done").addEventListener("click", function () {
  const minutes = leaveTimer();

  findStep(currentStepId).done = true;
  state.stats.stepsDone = state.stats.stepsDone + 1;
  state.stats.minutesFocused = state.stats.minutesFocused + minutes;

  // XP for the step, plus XP for the minutes spent on it.
  let xp = XP_PER_STEP + minutes * XP_PER_MINUTE;

  // Was that the last step? Then the whole task is finished: add it to
  // the finished list and give the bonus. "taskLogged" makes sure a
  // task is only counted once, even if steps are added to it later.
  if (!nextStep() && !state.taskLogged) {
    state.finishedTasks.push({
      text: state.task,
      steps: state.steps.length,
      date: todayText()
    });
    state.stats.tasksDone = state.stats.tasksDone + 1;
    state.taskLogged = true;
    xp = xp + XP_TASK_BONUS;
  }

  const reward = earn(xp);   // earn() also saves
  openDoneScreen(reward);
});

// "Back to steps" leaves the step exactly as it was. It is not marked
// as skipped or failed, and the minutes spent on it still count.
//
// FOCUS LOCK: if the countdown is still going (or paused part-way),
// the companion first asks whether the user really wants to stop.
// A web page is not allowed to control other tabs, so this cannot
// block other websites. It adds one gentle "are you sure?" and no more.
const leaveDialog = document.getElementById("leave-dialog");

document.getElementById("timer-back").addEventListener("click", function () {
  const midCountdown = !timerRunning.hidden && timerRemainingMs > 0;

  if (midCountdown && state.settings.focusLock) {
    // Minutes so far = minutes already counted + the part of this
    // countdown that has run.
    const ms = focusedMs + (countdownLengthMs - timerRemainingMs);
    const minutes = Math.floor(ms / 60000);
    const word = (minutes === 1) ? "minute" : "minutes";

    let text = "That's okay. You can come back to this step any time.";
    if (minutes > 0) {
      text = "That's okay. You've focused for " + minutes + " " + word + ", and that counts.";
    }
    document.getElementById("leave-text").textContent = text;

    leaveDialog.showModal();
  } else {
    stopForNow();
  }
});

document.getElementById("leave-stay").addEventListener("click", function () {
  leaveDialog.close();
});

document.getElementById("leave-go").addEventListener("click", function () {
  leaveDialog.close();
  stopForNow();
});

// The other half of the focus lock: if the user closes or reloads this
// tab while the timer is counting, the browser shows its own "Leave
// site?" box. Browsers don't let a page change the wording.
window.addEventListener("beforeunload", function (event) {
  if (timerInterval !== null && state.settings.focusLock) {
    event.preventDefault();
  }
});

function stopForNow() {
  const minutes = leaveTimer();
  openStepsScreen();

  if (minutes > 0) {
    state.stats.minutesFocused = state.stats.minutesFocused + minutes;
    earn(minutes * XP_PER_MINUTE);

    const word = (minutes === 1) ? "minute" : "minutes";
    let message = "You focused for " + minutes + " " + word + ". That counts.";
    if (isOn("rewards")) {
      message = message + " +" + (minutes * XP_PER_MINUTE) + " XP.";
    }

    const notice = document.getElementById("steps-notice");
    notice.textContent = message;
    notice.hidden = false;
    announce(message);
  }
}

// ==========================================================
// SCREEN 4: STEP DONE
// Gentle feedback: a check mark, a kind sentence, a soft sound, the
// progress count and what was earned (XP, levels, badges).
// ==========================================================

// One of these is shown each time a step is finished.
const DONE_MESSAGES = [
  "Nice work. That's one step out of the way.",
  "Done. Getting started is the hard part, and you did it.",
  "That one's finished. Well done."
];

// How many steps are finished.
function countDone() {
  return state.steps.filter(function (step) {
    return step.done;
  }).length;
}

// The progress sentence, e.g. "3 of 5 steps done".
function progressText() {
  const total = state.steps.length;
  const word = (total === 1) ? "step" : "steps";
  return countDone() + " of " + total + " " + word + " done";
}

// "reward" is the report from earn() in rewards.js: how much XP was
// just earned and whether anything new happened.
function openDoneScreen(reward) {
  showReward(reward);

  const doneCount = countDone();
  const step = nextStep();   // undefined when every step is done

  // Take the messages in turn. "%" is the remainder after dividing, so
  // the position goes 1, 2, 0, 1, 2, 0... and never runs off the end.
  let message = DONE_MESSAGES[doneCount % DONE_MESSAGES.length];
  if (!step) {
    message = "That was the last step. The whole task is done.";
  }
  document.getElementById("done-message").textContent = message;

  document.getElementById("done-progress").textContent = progressText();

  const bar = document.getElementById("done-bar");
  bar.max = state.steps.length;
  bar.value = doneCount;

  // Offer the next step, or a new task if there are no steps left.
  if (step) {
    document.getElementById("heading-done").textContent = "Step done";
    document.getElementById("done-next").textContent = "Start next step: " + step.text;
  } else {
    document.getElementById("heading-done").textContent = "All steps done";
    document.getElementById("done-next").textContent = "Start a new task";
  }

  showOrHideRewards();
  showScreen("screen-done");
  playChime();
}

// The check mark, kind message and progress bar are "rewards". Hide
// them when rewards are off. The heading, the progress sentence and
// the next-step button always stay, so the screen still works.
// The same goes for everything in index.html with the class
// "reward-only": the companion, the XP box and the header button.
// (XP is still counted quietly while rewards are hidden, so nothing is
// lost if the user turns them back on.)
function showOrHideRewards() {
  const rewardsOff = !isOn("rewards");
  document.getElementById("done-check").hidden = rewardsOff;
  document.getElementById("done-message").hidden = rewardsOff;
  document.getElementById("done-bar").hidden = rewardsOff;

  document.querySelectorAll(".reward-only").forEach(function (element) {
    element.hidden = rewardsOff;
  });

  // The companion screen is a reward too. If it is open, close it.
  if (rewardsOff && currentScreenId === "screen-pet") {
    showScreen(screenBeforePet);
  }
}

document.getElementById("done-next").addEventListener("click", function () {
  const step = nextStep();

  if (step) {
    openTimerScreen(step.id);
  } else {
    // Everything is done: clear the old task and go back to screen 1.
    state.task = "";
    state.steps = [];
    state.links = [];
    state.taskLogged = false;
    saveState();
    taskInput.value = "";
    showScreen("screen-task");
  }
});

document.getElementById("done-back").addEventListener("click", openStepsScreen);

// ----- Sound -----
// The chime is two short notes made by the browser itself (the Web
// Audio API), so the project needs no sound files.
let audioContext = null;   // created the first time a sound is played

function playChime() {
  if (!isOn("sound")) {
    return;
  }

  try {
    if (audioContext === null) {
      audioContext = new AudioContext();
    }
    playNote(660, 0);      // first note, straight away
    playNote(880, 0.15);   // a higher note, 0.15 seconds later
  } catch (error) {
    // No sound support in this browser: carry on silently.
  }
}

// Play one soft note. frequency is the pitch in hertz; delay is how
// many seconds from now it starts.
function playNote(frequency, delay) {
  const oscillator = audioContext.createOscillator();   // makes the tone
  const volume = audioContext.createGain();             // controls loudness
  const startTime = audioContext.currentTime + delay;

  oscillator.frequency.value = frequency;
  oscillator.connect(volume);
  volume.connect(audioContext.destination);   // destination = the speakers

  // Start quiet and fade out over 0.4 seconds, so it isn't a harsh beep.
  volume.gain.setValueAtTime(0.15, startTime);
  volume.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

  oscillator.start(startTime);
  oscillator.stop(startTime + 0.4);
}

// ==========================================================
// SETTINGS
// Three switches (sound, animation, rewards) plus "plain mode", which
// overrides all three. Plain mode exists for A/B testing: the same app
// with and without rewards.
// ==========================================================

// Is a setting switched on? Always false while plain mode is on.
// Every reward in the app asks this function before doing anything.
// Example: isOn("sound")
function isOn(name) {
  return !state.settings.plainMode && state.settings[name];
}

// Which checkbox in index.html belongs to which setting.
const SETTING_CHECKBOXES = {
  sound: "setting-sound",
  animation: "setting-animation",
  rewards: "setting-rewards",
  plainMode: "setting-plain",
  focusLock: "setting-focus-lock"
};

// Make the page match state.settings.
function applySettings() {
  // Tick or untick each checkbox.
  for (const name in SETTING_CHECKBOXES) {
    const checkbox = document.getElementById(SETTING_CHECKBOXES[name]);
    checkbox.checked = state.settings[name];
  }

  // In plain mode, grey out the three switches it overrides.
  document.getElementById("reward-settings").disabled = state.settings.plainMode;

  // styles.css switches off all animation while <body> has this class.
  document.body.classList.toggle("no-animation", !isOn("animation"));

  showOrHideRewards();
  showChosenPet();
  refreshPets();
}

// When a checkbox is ticked or unticked: remember it, save, and apply.
for (const name in SETTING_CHECKBOXES) {
  const checkbox = document.getElementById(SETTING_CHECKBOXES[name]);

  checkbox.addEventListener("change", function () {
    state.settings[name] = checkbox.checked;
    saveState();
    applySettings();
  });
}

document.getElementById("settings-open").addEventListener("click", function () {
  document.getElementById("settings-dialog").showModal();
});

// ----- Backup file -----
// There are no accounts (those need a server). A backup file does the
// same job by hand: save everything to a file, then load that file in
// another browser or on another computer.
const backupFileInput = document.getElementById("backup-file");
const backupMessage = document.getElementById("backup-message");

// Save: turn "state" into text and hand it to the browser as a download.
document.getElementById("backup-save").addEventListener("click", function () {
  const text = JSON.stringify(state, null, 2);   // "2" adds indents, so the file is readable
  const file = new Blob([text], { type: "application/json" });

  // The usual trick for downloading from a page: make a link to the
  // file, click it from code, then throw the link away.
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "task-starter-backup.json";
  link.click();
  URL.revokeObjectURL(link.href);

  backupMessage.textContent = "Backup saved to your downloads folder.";
});

// Load: the visible button opens the hidden file picker.
document.getElementById("backup-load").addEventListener("click", function () {
  backupFileInput.click();
});

// The user picked a file: read it as text.
backupFileInput.addEventListener("change", function () {
  const file = backupFileInput.files[0];
  if (!file) {
    return;
  }

  file.text().then(loadBackupText);
  backupFileInput.value = "";   // so the same file can be picked again later
});

// Check the text of a backup file and, if it is good, use it.
function loadBackupText(text) {
  // Is it one of our backups? It must be JSON and have a list of steps.
  let looksRight = false;
  try {
    const saved = JSON.parse(text);
    looksRight = (saved !== null && Array.isArray(saved.steps));
  } catch (error) {
    looksRight = false;
  }

  if (!looksRight) {
    backupMessage.textContent = "That file isn't a Task Starter backup. Nothing was changed.";
    return;
  }

  // Loading replaces what is saved here, so ask first.
  const sure = window.confirm("Replace everything saved in this browser with this backup?");
  if (!sure) {
    return;
  }

  // Store the backup, then reload the page so it starts up from it.
  localStorage.setItem(STORAGE_KEY, text);
  stopTicking();   // so the focus lock doesn't ask "Leave site?"
  location.reload();
}

// ==========================================================
// START THE APP
// This runs once, when the page opens. Keep it at the bottom of the
// file so everything above already exists.
// ==========================================================
loadState();
buildPetPicker();
applySettings();

// If a task was saved earlier, skip screen 1 and carry on from the steps.
if (state.task !== "") {
  openStepsScreen();
}
