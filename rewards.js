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
// Two numbers are kept:
//   state.xp     everything the user has ever earned. Sets the level.
//   state.petXp  what the current companion has earned. Sets its size.
// The companion grows at the petXp totals below. The first change
// comes quickly; the later ones take a lot longer. Once it is fully
// grown the user can hatch a new egg (see "THE FAMILY" further down),
// so there is always something still growing.
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
    if (state.petXp >= stage.fromXp) {
      result = stage;
    }
  }
  return result;
}

// The stage it will grow into next (undefined once fully grown).
function nextStage() {
  return STAGES.find(function (stage) {
    return stage.fromXp > state.petXp;
  });
}

// ==========================================================
// THEMES
// Color themes for the whole app. The colors themselves are in
// styles.css; this list only says which themes exist and at which
// level each one unlocks. The first two are free from the start, so a
// dark theme is always available to anyone who needs one.
// ==========================================================
const THEMES = [
  { id: "paper", name: "Paper", fromLevel: 1 },
  { id: "night", name: "Night (dark)", fromLevel: 1 },
  { id: "forest", name: "Forest", fromLevel: 3 },
  { id: "blossom", name: "Blossom", fromLevel: 6 },
  { id: "sunset", name: "Sunset", fromLevel: 10 }
];

// Build the list of theme choices in Settings. It is rebuilt whenever
// settings are applied, because a new level can unlock a theme.
function renderThemePicker() {
  const container = document.getElementById("theme-choices");
  container.innerHTML = "";

  for (const theme of THEMES) {
    const unlocked = currentLevel() >= theme.fromLevel;

    const label = document.createElement("label");
    label.className = "theme-choice";
    label.dataset.theme = theme.id;   // paints this choice in its own colors

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "theme";
    radio.value = theme.id;
    radio.checked = (state.settings.theme === theme.id);
    radio.disabled = !unlocked;

    const name = document.createElement("span");
    name.textContent = theme.name;
    if (!unlocked) {
      name.textContent = theme.name + " (unlocks at level " + theme.fromLevel + ")";
    }

    radio.addEventListener("change", function () {
      state.settings.theme = theme.id;
      saveState();
      applySettings();   // this rebuilds the list...

      // ...so put keyboard focus back on the choice that was just made.
      document.querySelector('input[name="theme"]:checked').focus();
    });

    label.append(radio, name);
    container.append(label);
  }
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
    earned: function () { return state.petXp >= 50 || state.family.length >= 1; }
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
    how: "Raise a companion until it is fully grown.",
    earned: function () { return state.petXp >= 1000 || state.family.length >= 1; }
  },

  // Longer-term badges, for after the first companion has grown up.
  {
    id: "level-10",
    name: "Level 10",
    how: "Reach level 10.",
    earned: function () { return currentLevel() >= 10; }
  },
  {
    id: "fifty-steps",
    name: "Fifty steps",
    how: "Finish fifty steps in total.",
    earned: function () { return state.stats.stepsDone >= 50; }
  },
  {
    id: "five-hours",
    name: "Five hours of focus",
    how: "Run the timer for 300 minutes in total.",
    earned: function () { return state.stats.minutesFocused >= 300; }
  },
  {
    id: "ten-tasks",
    name: "Ten tasks",
    how: "Finish ten whole tasks.",
    earned: function () { return state.stats.tasksDone >= 10; }
  },
  {
    id: "level-25",
    name: "Level 25",
    how: "Reach level 25.",
    earned: function () { return currentLevel() >= 25; }
  },
  {
    id: "family-of-three",
    name: "Family of three",
    how: "Raise three companions until they are fully grown.",
    earned: function () { return state.family.length >= 3; }
  },
  {
    id: "full-house",
    name: "Full house",
    how: "Raise one of every animal.",
    earned: function () {
      // Is every animal in pets.js somewhere in the family?
      return PETS.every(function (pet) {
        return state.family.some(function (member) {
          return member.pet === pet.id;
        });
      });
    }
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
  state.petXp = state.petXp + xpAmount;
  rememberToday();
  const newBadges = collectNewBadges();

  // Did this reach a level that unlocks a theme?
  const newLevel = currentLevel();
  const newThemes = [];
  for (const theme of THEMES) {
    if (theme.fromLevel > oldLevel && theme.fromLevel <= newLevel) {
      newThemes.push(theme.name);
    }
  }

  saveState();
  refreshPets();
  renderThemePicker();   // so a newly unlocked theme can be chosen

  return {
    xp: xpAmount,
    levelUp: newLevel > oldLevel,
    grew: currentStage() !== oldStage,
    newBadges: newBadges,
    newThemes: newThemes
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
  if (reward.grew && currentStage().id === "adult") {
    lines.push("It is fully grown. You can hatch a new egg on the companion screen.");
  }
  for (const name of reward.newThemes) {
    lines.push("New theme unlocked: " + name + ". Find it in Settings.");
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
    stage.name + ". Level " + currentLevel() + ", " + state.xp + " XP in total.";
  document.getElementById("pet-xp-bar").value = state.xp % XP_PER_LEVEL;

  const next = nextStage();
  if (next) {
    document.getElementById("pet-next").textContent =
      xpToNextLevel() + " XP to the next level. It grows into a " +
      next.name.toLowerCase() + " in " + (next.fromXp - state.petXp) + " more XP.";
  } else {
    document.getElementById("pet-next").textContent =
      xpToNextLevel() + " XP to the next level. Your companion is fully grown.";
  }

  // The "hatch a new egg" box only appears once this one is fully grown.
  document.getElementById("new-egg-box").hidden = (stage.id !== "adult");

  // The family: every companion raised so far, fully grown.
  const familyList = document.getElementById("family-list");
  familyList.innerHTML = "";

  for (const member of state.family) {
    const figure = document.createElement("figure");
    figure.className = "family-member";

    const canvas = document.createElement("canvas");
    canvas.className = "pet-canvas pet-small";
    canvas.setAttribute("aria-hidden", "true");
    drawPet(canvas, member.pet, "adult");

    const caption = document.createElement("figcaption");
    caption.textContent = findPet(member.pet).name;

    figure.append(canvas, caption);
    familyList.append(figure);
  }
  document.getElementById("family-empty").hidden = (state.family.length > 0);

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
// THE FAMILY
// This is the long-term goal. When a companion is fully grown, the
// user can hatch a new egg. The grown one is not lost: it joins the
// family and stays on the companion screen for good. Total XP and the
// level carry on as before; only petXp starts again for the new egg.
// ==========================================================
document.getElementById("new-egg").addEventListener("click", function () {
  // The grown companion joins the family.
  state.family.push({ pet: state.pet, date: todayText() });

  // Pick the new egg: the first animal that isn't in the family yet.
  // If the user has raised them all, take the next one in the list.
  let newPet = PETS.find(function (pet) {
    return !state.family.some(function (member) {
      return member.pet === pet.id;
    });
  });

  if (!newPet) {
    const position = PETS.indexOf(findPet(state.pet));
    newPet = PETS[(position + 1) % PETS.length];   // % wraps back to the start
  }

  state.pet = newPet.id;
  state.petXp = 0;
  collectNewBadges();
  saveState();

  applySettings();   // updates the picker in Settings and redraws everything
  renderPetScreen();
  announce("A new egg! Your grown companion has joined the family.");
  document.getElementById("heading-pet").focus();
});

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
    canvas.dataset.pet = pet.id;   // redrawPetPicker() paints it

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

// Paint every animal in the picker, fully grown, so the user can see
// what each one will become.
function redrawPetPicker() {
  document.querySelectorAll("#pet-choices canvas").forEach(function (canvas) {
    drawPet(canvas, canvas.dataset.pet, "adult");
  });
}

// Tick the radio button of the companion that is saved in state.
function showChosenPet() {
  const radio = document.querySelector('input[name="pet"][value="' + findPet(state.pet).id + '"]');
  radio.checked = true;
}
