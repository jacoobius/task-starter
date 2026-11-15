# PLAN

Shared task list for all agents (Claude Code and Codex). Rules are in AGENTS.md.

## How to use this file
- Status is one of: `todo`, `in progress (agent name)`, `done`.
- Before starting a task, change its status to `in progress (your agent name)`.
- When finished, change it to `done` and add a short note under "Notes"
  saying what changed and why, in plain English.
- Work on a branch named `claude/<task>` or `codex/<task>`. Never commit to main.

## Tasks

| #  | Task | Status | Branch |
|----|------|--------|--------|
| 1  | Page skeleton: index.html, styles.css, app.js, with all colors and fonts as CSS variables in one place | done | claude/page-skeleton |
| 2  | Screen 1: type one task you're avoiding | done | claude/task-entry |
| 3  | Screen 2: break the task into steps (add, edit, reorder, delete) | done | claude/steps |
| 4  | Save and load the task and steps with localStorage | done | claude/storage |
| 5  | Screen 3: large countdown timer for one step (user-chosen length, default 10 minutes) | done | claude/timer |
| 6  | Completion: gentle feedback, progress ("3 of 5 steps done"), offer the next step | done | claude/completion |
| 7  | Settings: toggles for sound, animation, rewards, plus one switch that turns all rewards off | done | claude/settings |
| 8  | Accessibility pass: keyboard navigation, visible focus, AA contrast, reduced motion, ARIA labels | done | claude/accessibility |
| 9  | Match the Unit 4 brief: name one specific constraint and moment, mark the "majority would choose differently" moment, draft the purpose and rationale | done | claude/unit4-brief |

## Notes
(Newest first. One short entry per finished task: what changed and why.)

- Task 9, Unit 4 brief (Claude): the brief asks for one specific access
  need and moment, a marked moment where a majority design would choose
  differently, and a half-page rationale. No app behaviour changed.
  (1) AGENTS.md now names the constraint: a student with ADHD freezing at
  the start of a writing assignment due tomorrow. Claude picked this as a
  suggestion; Jacob should confirm or change it.
  (2) The hint on screen 1 gained an example, "start my essay".
  (3) docs/times-up.jpg is a screenshot of the marked moment: the timer at
  zero asking "Finished, or want a bit longer?" with no failure state.
  (4) docs/unit4-draft.md is a draft of the purpose and rationale for
  Jacob to rewrite in his own words and export to PDF.
  Still open: the brief says "not a multi-screen app" and this has four
  short screens. That is a question for the instructor.

- Task 8, accessibility pass (Claude): checked the finished app and fixed
  what the check found.
  Checked: measured the contrast of every color pair from the CSS
  variables (text 14:1, muted text 6.1:1, accent 7.2:1, white on accent
  7.6:1, borders 3.5:1, focus ring 4.8:1; AA needs 4.5:1 for text and 3:1
  for outlines). Every button and input has a name for screen readers. No
  sideways scrolling at 320px wide. Step buttons are at least 41x44px.
  Fixed: (1) announce() now clears the status line first, so the same
  message twice in a row is spoken both times. (2) The four step buttons
  are grouped so they wrap together on a narrow screen. (3) The focus ring
  no longer shows on screen headings, which receive focus only so screen
  readers read them.
  NOT checked: no test with a real screen reader, no test with the
  device's reduced-motion setting actually switched on (the CSS rule is
  there but unproven), and only one browser was used. A screen reader
  user is told when the timer starts, pauses and ends, but not the time
  left along the way.

- Note on branches (Claude): tasks 2 to 8 were done in a row, so each
  branch was started from the one before it (claude/task-entry ->
  claude/steps -> claude/storage -> claude/timer -> claude/completion ->
  claude/settings -> claude/accessibility). The last branch contains all
  of them.

- Task 7, settings (Claude): a Settings button in the header opens a
  pop-up (the browser's built-in <dialog>) with four checkboxes: sound,
  animation, rewards, and plain mode. Settings are saved with everything
  else. One function, isOn(name), is the only place that decides whether a
  reward happens, and it always answers "no" in plain mode, so plain mode
  can't miss anything. For A/B testing: plain mode on = no sound, no
  animation, no check mark, no kind message, no progress bar.
  Decision to check with Jacob: the progress sentence ("3 of 5 steps
  done") stays visible even in plain mode, because it is information the
  user needs, not a reward. Only the bar is treated as a reward.

- Task 6, completion (Claude): added a fourth screen, "Step done", shown
  after "I finished this step". It has a check mark that grows into place
  once, one of three kind sentences, a soft two-note chime, the progress
  sentence ("3 of 5 steps done") with a bar, and one main button: "Start
  next step: ...". When every step is done the button becomes "Start a new
  task", which clears the old task and steps. The steps screen shows the
  same progress sentence. The chime is made by the browser (Web Audio), so
  there are no sound files; it also plays when the timer reaches zero.
  There are no points, streaks or scores anywhere.

- Task 5, timer (Claude): the steps screen now has one main button,
  "Start: <first step not done>", which opens screen 3. Screen 3 first asks
  for minutes (1 to 120, default 10, and it remembers the last choice),
  then shows a large countdown with Pause/Resume. The timer works by
  storing the clock time when it should end and checking the clock four
  times a second, so it stays accurate in a background tab; the time left
  also shows in the tab title. At zero nothing is forced: the user picks
  "I finished this step" or "Add more time". "Back to steps" leaves the
  step unchanged, with no skipped or failed marking. Finished steps show a
  small "Done" label. A running timer is not saved, so reloading the page
  stops it.

- Task 4, saving (Claude): the whole state object is saved to localStorage
  as JSON under the key "task-starter" after every change (saveState), and
  read back once when the page opens (loadState). If a task was saved, the
  app opens straight on the steps screen. Both functions use try/catch so
  the app still works when storage is blocked; it just won't remember.

- Task 3, steps screen (Claude): screen 2 now has an "Add a step" box and a
  numbered list. Each step has Edit, Up, Down and Delete buttons. Steps
  live in state.steps as { id, text, done }. After any change the list is
  wiped and rebuilt by renderSteps(), which is simpler to follow than
  updating single rows. Because rebuilding loses keyboard focus,
  focusStepButton() puts focus back on the same button afterwards.
  Reordering uses buttons, not drag and drop, so it works by keyboard.
  Delete is immediate, with no "are you sure?" and no undo.

- Task 2, task entry screen (Claude): screen 1 now has a labelled text box
  and one button, "Next: break it down". Submitting saves the text in a
  single "state" object in app.js and opens screen 2, which shows the task
  name and a "Change task" button to go back. Added shared styles for
  inputs and three button looks (normal, primary, quiet), and an invisible
  status line that app.js uses to speak short messages to screen readers.

- Task 1, page skeleton (Claude): added index.html, styles.css and app.js.
  index.html has the three screens (task, steps, timer) as empty sections
  with only the first one visible. styles.css starts with one block of CSS
  variables holding every color, font and spacing value, so the look can be
  changed in one place; it also has the focus ring, the skip link and the
  reduced-motion rule. app.js has one function, showScreen(id), which shows
  one screen, hides the others and moves focus to the new heading so
  keyboard and screen-reader users notice the change. No screen does
  anything yet; that is tasks 2 to 6.

- Project setup (Claude): created AGENTS.md, CLAUDE.md and this PLAN.md, and
  initialised git, so both agents share the same rules and task list.
