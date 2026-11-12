// Task Starter
// This file controls which screen is visible. Later tasks add the
// behaviour for each screen (task entry, steps, timer).

// The ids of the three screens in index.html.
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
