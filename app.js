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
  nextStepId: 1       // id to give the next new step, so every id is unique
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
}

// Call this after any change to the steps: redraw the list and tell
// screen-reader users what happened.
function stepsChanged(message) {
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
