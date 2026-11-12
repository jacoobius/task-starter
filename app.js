// Task Starter
// Plain JavaScript, no libraries. The file is split into sections,
// one per screen, in the same order as the screens in index.html.

// ==========================================================
// STATE
// Everything the app needs to remember lives in this one object.
// ==========================================================
const state = {
  task: ""            // the task the user is avoiding
};

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
const SCREEN_IDS = ["screen-task", "screen-steps", "screen-timer"];

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
  openStepsScreen();
});

// ==========================================================
// SCREEN 2: THE STEPS
// ==========================================================

function openStepsScreen() {
  renderSteps();
  showScreen("screen-steps");
}

// Redraw the steps screen so it matches what is in "state".
function renderSteps() {
  document.getElementById("steps-task-name").textContent = state.task;
}

// "Change task" goes back to screen 1 with the current task filled in.
document.getElementById("change-task").addEventListener("click", function () {
  taskInput.value = state.task;
  showScreen("screen-task");
});
