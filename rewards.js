// Task Starter: rewards
// XP, levels, the growing companion, badges and the companion screen.
//
// This file uses "state" and saveState() from app.js and the pictures
// from pets.js. One rule runs through all of it: rewards are only ever
// added. Nothing here takes XP, levels, badges or growth away.

// ==========================================================
// XP AND LEVELS
// ==========================================================
const XP_PER_STEP = 10;     // for finishing a step
const XP_PER_MINUTE = 1;    // for each full minute the timer ran
const XP_TASK_BONUS = 20;   // extra, for finishing every step of a task
const XP_PER_LEVEL = 50;    // every 50 XP is one level

// Level 1 is 0-49 XP, level 2 is 50-99 XP, and so on.
function currentLevel() {
  return Math.floor(state.xp / XP_PER_LEVEL) + 1;
}

// How much XP is still needed for the next level.
function xpToNextLevel() {
  return XP_PER_LEVEL - (state.xp % XP_PER_LEVEL);
}

// ==========================================================
// GROWTH
// The companion grows at these XP totals. The first change comes
// quickly; the later ones take a lot longer.
// ==========================================================
const STAGES = [
  { id: "egg", name: "Egg", fromXp: 0 },
  { id: "hatchling", name: "Hatchling", fromXp: 50 },
  { id: "young", name: "Youngster", fromXp: 300 },
  { id: "adult", name: "Grown-up", fromXp: 1000 }
];

// The stage the companion is at now: the last one whose XP was reached.
function currentStage() {
  let result = STAGES[0];
  for (const stage of STAGES) {
    if (state.xp >= stage.fromXp) {
      result = stage;
    }
  }
  return result;
}

// The stage it will grow into next (undefined once fully grown).
function nextStage() {
  return STAGES.find(function (stage) {
    return stage.fromXp > state.xp;
  });
}

// ==========================================================
// BADGES
// A second kind of reward: small markers for things the user has done.
// Each badge has a test, "earned", that looks at the saved numbers.
// None of them depends on doing something every day in a row, so a
// badge can never be "missed" or broken.
// ==========================================================
const BADGES = [
  {
    id: "first-step",
    name: "First step",
    how: "Finish one step.",
    earned: function () { return state.stats.stepsDone >= 1; }
  },
  {
    id: "hatched",
    name: "Hatched",
    how: "Earn 50 XP so your egg hatches.",
    earned: function () { return state.xp >= 50; }
  },
  {
    id: "whole-task",
    name: "Whole task",
    how: "Finish every step of a task.",
    earned: function () { return state.stats.tasksDone >= 1; }
  },
  {
    id: "came-back",
    name: "Came back",
    how: "Use the app on two different days.",
    earned: function () { return state.stats.daysActive.length >= 2; }
  },
  {
    id: "ten-steps",
    name: "Ten steps",
    how: "Finish ten steps in total.",
    earned: function () { return state.stats.stepsDone >= 10; }
  },
  {
    id: "focus-hour",
    name: "An hour of focus",
    how: "Run the timer for 60 minutes in total.",
    earned: function () { return state.stats.minutesFocused >= 60; }
  },
  {
    id: "three-tasks",
    name: "Three tasks",
    how: "Finish three whole tasks.",
    earned: function () { return state.stats.tasksDone >= 3; }
  },
  {
    id: "five-days",
    name: "Five days",
    how: "Use the app on five different days. They don't need to be in a row.",
    earned: function () { return state.stats.daysActive.length >= 5; }
  },
  {
    id: "grown",
    name: "All grown up",
    how: "Earn 1000 XP so your companion is fully grown.",
    earned: function () { return state.xp >= 1000; }
  }
];

// Hand out any badges that have just been earned.
// Returns the names of the new ones (an empty list if there are none).
function collectNewBadges() {
  const newNames = [];

  for (const badge of BADGES) {
    const alreadyHas = state.badges.includes(badge.id);
    if (!alreadyHas && badge.earned()) {
      state.badges.push(badge.id);
      newNames.push(badge.name);
    }
  }
  return newNames;
}

// ==========================================================
// EARNING
// ==========================================================

// Today's date as text, e.g. "2026-11-16".
function todayText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Note that the app was used today (once per day).
function rememberToday() {
  const today = todayText();
  if (!state.stats.daysActive.includes(today)) {
    state.stats.daysActive.push(today);
  }
}

// Give the user some XP. This is the only place XP is added.
// It returns a small report of what happened, which the "step done"
// screen uses to say "+14 XP", "Level up!" and so on.
function earn(xpAmount) {
  const oldLevel = currentLevel();
  const oldStage = currentStage();

  state.xp = state.xp + xpAmount;
  rememberToday();
  const newBadges = collectNewBadges();

  saveState();
  refreshPets();

  return {
    xp: xpAmount,
    levelUp: currentLevel() > oldLevel,
    grew: currentStage() !== oldStage,
    newBadges: newBadges
  };
}

// ==========================================================
// SHOWING THE COMPANION
// ==========================================================

// Redraw the user's companion everywhere it appears. Every canvas in
// index.html marked data-pet="mine" shows it.
function refreshPets() {
  const stage = currentStage();

  document.querySelectorAll('canvas[data-pet="mine"]').forEach(function (canvas) {
    drawPet(canvas, state.pet, stage.id);
  });

  // The button in the header.
  document.getElementById("pet-open-text").textContent = "Level " + currentLevel();

  // If the companion screen is open, bring it up to date too.
  if (!document.getElementById("screen-pet").hidden) {
    renderPetScreen();
  }
}

// Fill in the reward box on the "step done" screen from an earn() report.
function showReward(reward) {
  document.getElementById("done-xp").textContent = "+" + reward.xp + " XP";
  document.getElementById("done-level").textContent =
    "Level " + currentLevel() + ". " + xpToNextLevel() + " XP to the next level.";
  document.getElementById("done-xp-bar").value = state.xp % XP_PER_LEVEL;

  // Any good news: a new level, a growth spurt, new badges.
  const news = document.getElementById("done-news");
  news.innerHTML = "";

  const lines = [];
  if (reward.levelUp) {
    lines.push("Level up! You reached level " + currentLevel() + ".");
  }
  if (reward.grew) {
    if (currentStage().id === "hatchling") {
      lines.push("Your egg hatched!");
    } else {
      lines.push("Your companion grew into a " + currentStage().name.toLowerCase() + "!");
    }
  }
  for (const name of reward.newBadges) {
    lines.push("New badge: " + name);
  }

  for (const line of lines) {
    const item = document.createElement("li");
    item.textContent = line;
    news.append(item);
  }
}

// ==========================================================
// THE COMPANION SCREEN
// Shows the companion, its level, the numbers, the badges and the
// list of finished tasks.
// ==========================================================

// Which screen to go back to when the companion screen is closed.
let screenBeforePet = "screen-task";

document.getElementById("pet-open").addEventListener("click", function () {
  // currentScreenId comes from app.js. Don't overwrite it if the
  // companion screen is already open.
  if (currentScreenId !== "screen-pet") {
    screenBeforePet = currentScreenId;
  }
  renderPetScreen();
  showScreen("screen-pet");
});

document.getElementById("pet-back").addEventListener("click", function () {
  showScreen(screenBeforePet);
});

// Make a list item with some text and add it to a list.
function addListItem(list, text) {
  const item = document.createElement("li");
  item.textContent = text;
  list.append(item);
  return item;
}

function renderPetScreen() {
  const pet = findPet(state.pet);
  const stage = currentStage();

  // A description of the picture, for screen readers.
  let description = pet.name + ", " + stage.name.toLowerCase();
  if (stage.id === "egg") {
    description = "An egg";
  }
  document.getElementById("pet-big").setAttribute("aria-label", description);

  // Level and XP.
  document.getElementById("pet-level").textContent =
    stage.name + ". Level " + currentLevel() + ", " + state.xp + " XP.";
  document.getElementById("pet-xp-bar").value = state.xp % XP_PER_LEVEL;

  const next = nextStage();
  if (next) {
    document.getElementById("pet-next").textContent =
      xpToNextLevel() + " XP to the next level. Next growth: " +
      next.name.toLowerCase() + " at " + next.fromXp + " XP.";
  } else {
    document.getElementById("pet-next").textContent =
      xpToNextLevel() + " XP to the next level. Your companion is fully grown.";
  }

  // The numbers.
  const stats = document.getElementById("pet-stats");
  stats.innerHTML = "";
  addListItem(stats, "Steps finished: " + state.stats.stepsDone);
  addListItem(stats, "Minutes focused: " + state.stats.minutesFocused);
  addListItem(stats, "Tasks finished: " + state.stats.tasksDone);
  addListItem(stats, "Days you showed up: " + state.stats.daysActive.length);

  // Badges. Earned ones show their name. The others show how to earn
  // them, as something to look forward to.
  const badgeList = document.getElementById("badge-list");
  badgeList.innerHTML = "";

  for (const badge of BADGES) {
    const hasIt = state.badges.includes(badge.id);
    const item = document.createElement("li");
    item.className = hasIt ? "badge" : "badge badge-locked";

    const name = document.createElement("strong");
    name.textContent = hasIt ? "★ " + badge.name : badge.name;   // ★ is a star

    const how = document.createElement("span");
    how.textContent = hasIt ? "Earned." : "To earn: " + badge.how;

    item.append(name, how);
    badgeList.append(item);
  }

  // Finished tasks, newest first.
  const finishedList = document.getElementById("finished-list");
  finishedList.innerHTML = "";

  const newestFirst = state.finishedTasks.slice().reverse();
  for (const task of newestFirst) {
    const word = (task.steps === 1) ? "step" : "steps";
    addListItem(finishedList, task.text + " (" + task.steps + " " + word + ", " + task.date + ")");
  }
  document.getElementById("finished-empty").hidden = (state.finishedTasks.length > 0);
}

// ==========================================================
// CHOOSING A COMPANION (in Settings)
// ==========================================================

// Build one choice per animal: a radio button, a picture and a name.
// Runs once when the app starts.
function buildPetPicker() {
  const container = document.getElementById("pet-choices");

  for (const pet of PETS) {
    const label = document.createElement("label");
    label.className = "pet-choice";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "pet";        // same name = only one can be chosen
    radio.value = pet.id;

    const canvas = document.createElement("canvas");
    canvas.className = "pet-canvas pet-small";
    canvas.setAttribute("aria-hidden", "true");
    drawPet(canvas, pet.id, "adult");   // show what it will grow into

    const name = document.createElement("span");
    name.textContent = pet.name;

    radio.addEventListener("change", function () {
      state.pet = pet.id;
      saveState();
      refreshPets();
    });

    label.append(radio, canvas, name);
    container.append(label);
  }
}

// Tick the radio button of the companion that is saved in state.
function showChosenPet() {
  const radio = document.querySelector('input[name="pet"][value="' + findPet(state.pet).id + '"]');
  radio.checked = true;
}
