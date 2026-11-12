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
  timerMinutes: 10    // the timer length the user last chose
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
      Object.assign(state, saved);
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
  document.getElementById("status").textContent = message;
}

// ==========================================================
// SCREENS
// ==========================================================

// The ids of the screens in index.html.
const SCREEN_IDS = ["screen-task", "screen-steps", "screen-timer", "screen-done"];

// Show one screen and hide the others.
// Example: showScreen("screen-steps")
function showScreen(screenId) {
  for (const id of SCREEN_IDS) {
    const screen = document.getElementById(id);
    screen.hidden = (id !== screenId);
  }

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

  row.append(text, editButton, upButton, downButton, deleteButton);
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

  state.steps.push({ id: state.nextStepId, text: text, done: false });
  state.nextStepId = state.nextStepId + 1;

  // Clear the box and keep the cursor in it, ready for the next step.
  stepInput.value = "";
  stepInput.focus();
  stepsChanged("Step added: " + text);
});

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

// Open the timer screen for one step, showing part A.
function openTimerScreen(stepId) {
  stopTicking();
  currentStepId = stepId;

  document.getElementById("timer-step-name").textContent = findStep(stepId).text;
  timerMinutesInput.value = state.timerMinutes;
  timerSetup.hidden = false;
  timerRunning.hidden = true;

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
function leaveTimer() {
  stopTicking();
  document.title = APP_TITLE;
}

// "I finished this step" works at any time, not only when time is up.
document.getElementById("timer-done").addEventListener("click", function () {
  findStep(currentStepId).done = true;
  saveState();
  leaveTimer();
  openDoneScreen();
});

// "Back to steps" leaves the step exactly as it was. It is not marked
// as skipped or failed.
document.getElementById("timer-back").addEventListener("click", function () {
  leaveTimer();
  openStepsScreen();
});

// ==========================================================
// SCREEN 4: STEP DONE
// Gentle feedback only: a check mark, a kind sentence, a soft sound
// and the progress count. No points, streaks or scores.
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

function openDoneScreen() {
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

  showScreen("screen-done");
  playChime();
}

document.getElementById("done-next").addEventListener("click", function () {
  const step = nextStep();

  if (step) {
    openTimerScreen(step.id);
  } else {
    // Everything is done: clear the old task and go back to screen 1.
    state.task = "";
    state.steps = [];
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
// START THE APP
// This runs once, when the page opens. Keep it at the bottom of the
// file so everything above already exists.
// ==========================================================
loadState();

// If a task was saved earlier, skip screen 1 and carry on from the steps.
if (state.task !== "") {
  openStepsScreen();
}
