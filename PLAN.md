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
| 10 | Make the site ready for GitHub Pages (README, no build step) and update AGENTS.md for the new direction (XP and companions allowed) | done | claude/github-pages |
| 11 | Pixel companions that grow from an egg, with XP, levels, badges and a companion screen | done | claude/companion |
| 12 | Links for the task beside the timer, and a focus lock that asks before leaving a running timer | done | claude/focus-lock |
| 13 | Extras: starter step ideas for the frozen moment, and a backup file in place of accounts | done | claude/extras |
| 14 | Color themes (some unlock with levels) and a larger-text setting | done | claude/themes |
| 15 | Longer progression: each companion grows on its own, grown ones join a family, new eggs, more badges | done | claude/progression |
| 16 | Animations (confetti, hops, egg wobble, screen fade), naming and patting the companion | done | claude/animations |
| 17 | Timer extras: a bar that empties, quick length buttons, and a break timer | done | claude/timer-extras |
| 19 | Staying power: welcome back, things you started, treasures, more varied lines, help with too-big steps, a planned treat, a working companion, background sound | done | claude/staying-power |
| 20 | Focus Lock browser extension that pauses other sites during the timer | done | claude/extension |
| 21 | Stop browsers mixing old and new files after an update | done | claude/cache-fix |
| 22 | Fix the Focus Lock letting some pages through | done | claude/extension-fix |
| 23 | Install guide and download for the Focus Lock extension | done | claude/install-guide |

## Notes
(Newest first. One short entry per finished task: what changed and why.)

- Task 23, install guide (Claude): Jacob asked for the steps and files
  needed to install the extension. Added a download,
  downloads/task-starter-focus-lock.zip (a zipped copy of the extension
  folder, about 8 KB), and a new page, install.html, on the live site:
  what you need, 7 install steps, how to check it works, what the
  permission warning means, updating, removing, and a table of the
  files. It uses the app's styles.css and the user's saved theme.
  Settings now links to it. The README points there too, and has the
  command to rebuild the zip; AGENTS.md now says to rebuild it after any
  extension change. File links are now ?v=22.
  Checked: the page, the download (200, 7763 bytes, six files inside)
  and the Settings link in the preview. Jacob already confirmed on
  2026-11-20 that the extension connects ("Other websites are paused"
  appeared). NOT checked: installing from the zip itself.

- Task 22, Focus Lock fix (Claude): Jacob found that the extension still
  let pages open in a new tab. Likely cause, from Chrome's docs: while
  you type an address, Chrome often loads the page early in a hidden
  "prerender" tab, then swaps it in when you press Enter. The extension
  only checked the moment a tab starts loading, which a swapped-in page
  never does. background.js now checks a page in three ways, all through
  one function, checkPage(): just before it loads, when it has actually
  arrived (this also catches redirects and the Back button), and when a
  preloaded page is swapped in. Hidden prerenders are skipped until they
  are swapped in.
  The website now shows "Other websites are paused" only after the
  extension answers that the lock is on (bridge.js passes the answer
  back as "lock-result"), so it is easy to see whether it is working.
  Extension version is now 1.1; file links are now ?v=21. The README has
  a short troubleshooting list. Checked against a fake version of
  Chrome's functions. NOT checked in a real browser: Jacob needs to
  reload the extension and try typing a site into a new tab again.

- Task 21, cache fix (Claude): after publishing task 20, the live site
  loaded the new index.html with an old, saved copy of app.js. Browsers
  keep copies of files for up to 10 minutes on GitHub Pages, and new
  HTML with old JavaScript (or the other way round) can break the page.
  index.html now asks for "styles.css?v=20", "app.js?v=20" and so on.
  The number means nothing to the server, but a new number makes the
  browser fetch a fresh copy. Raise it whenever a .css or .js file
  changes (now a rule in AGENTS.md).

- Task 20, Focus Lock extension (Claude): Jacob asked again for the tab
  lock. A website can't do it, so this is a Chrome/Edge extension in the
  new extension folder, which the website talks to.
  How it fits together: bridge.js runs inside the Task Starter page and
  says "hello", so app.js knows the extension is there. When the
  countdown starts or resumes, app.js sends "lock" with the end time and
  the saved links' site names; when it stops for any reason it sends
  "unlock" (both from startTicking() and stopTicking()). background.js
  watches each new page load and, during a lock, sends any site that
  isn't allowed to blocked.html ("Paused while you focus"), which offers
  Back to Task Starter, Allow this site for this timer, and Unlock now.
  Safety: the lock ends by itself at the timer's end, after 3 hours at
  most, when the Task Starter tab closes and when the browser restarts.
  Pages already open are never touched. Only the Task Starter page can
  start a lock, and only blocked.html can allow sites.
  Permission choice: blocking with Chrome's declarativeNetRequest
  redirect would need access to "all your data on all websites", so
  Claude used webNavigation instead (install warning: "Read your
  browsing history"). The downside: a paused page may start loading for
  a split second before it is replaced.
  Settings has a new switch, "Pause other websites during the timer"
  (on by default, does nothing without the extension), and shows
  whether the extension is installed.
  Checked: the website's messages by pretending to be the extension;
  background.js against a fake version of Chrome's functions (allowed
  and blocked sites, look-alike sites, sub-sites, who may send which
  message, and every way a lock ends); blocked.html in both states.
  NOT checked: the extension installed in a real browser. Claude cannot
  install extensions, so Jacob needs to load it once and try it.

- Task 19, staying power (Claude): Jacob asked what to do about rewards
  wearing off, then said to build whatever helps. (Task 18, the AI log,
  is on its own branch, claude/ai-log, and is not merged.) This was done
  as one branch instead of four, because the parts share the same code.
  The idea: stop relying on novelty alone, plan for people drifting
  away, and make the first move easier.
  (1) Welcome back: after 3 or more days away, a box says "Welcome back.
  [Name] kept your spot." with "Pick up where I left off" and "Start
  fresh". It never mentions missed days. state.lastVisit holds the last
  day the app was opened; daysBetween() does the date sums. clearTask()
  is now shared by "Start fresh" and "Start a new task".
  (2) Things you started: every task gets recorded the first time a timer
  starts for it, finished or not, because starting is the goal. The
  companion screen lists them with "In the last 7 days you started N
  tasks". Each record also notes whether plain mode was on, so a backup
  file now holds what an A/B test needs.
  (3) Treasures: the first step finished on any day (not "in a row")
  brings one of ten small pixel items. Five only turn up at certain
  times of year, so there is something new across the seasons. Pictures
  are in pets.js; rules are in rewards.js.
  (4) Variety: 16 finish messages instead of 3, picked at random but
  never the same twice in a row (pickLine()). Patting gives a different
  reaction each time.
  (5) Too-big steps: "This step feels too big" on the timer screen goes
  back to the steps and puts the next step added in front of it.
  Also a "Just 2 min" quick length, and after three finished steps the
  timer says how long steps usually take (the median, so one long step
  doesn't skew it).
  (6) A planned treat: the user can write their own reward ("a cup of
  tea"), shown after each step. A self-chosen reward keeps its meaning
  longer than points.
  (7) A working companion: during the timer a caption under the
  companion changes every two minutes ("Pip is reading quietly beside
  you"), a light version of body doubling.
  (8) Background sound: Off, Soft noise or Rain, made by the browser
  (no files). It is a focus tool, so plain mode does not turn it off.
  Two badges added: Ten starts, Treasure hunter.
  Plain mode hides the treat, treasures, captions and welcome mention of
  the companion. Checked by script in the preview, including plain mode
  and 320px width, with no console errors. NOT checked: whether the
  background sound is pleasant (it can't be heard from here), a screen
  reader, and whether any of this actually slows novelty wearing off.
  That needs the one-to-two-week test.

- Task 17, timer extras (Claude): three small additions around the timer.
  (1) A bar under the countdown that empties as time passes. People with
  ADHD often find it hard to feel how much time is left from numbers
  alone, and a shrinking bar shows it at a glance. tick() sets its width
  as a percentage of the full time.
  (2) Quick-length buttons (5, 10, 15, 25 minutes) that fill in the
  minutes box.
  (3) "Take a 5-minute break first" on the "step done" screen. It is a
  second, very simple countdown with its own variables. It earns nothing
  and nothing happens if it is skipped. formatTime() was split out of
  showTime() so both countdowns share it.
  Checked by script in the preview for tasks 14 to 17: theme contrast,
  theme locking, the old-save migration, growing up and hatching a new
  egg, confetti on and off, naming, patting, the bar, the presets, the
  break, and no sideways scroll at 320px. NOT checked: a screen reader,
  the device's reduced-motion setting, and browsers other than the
  preview one.

- Task 16, animations, name and pats (Claude): all the movement is CSS
  animation in styles.css; the JavaScript only adds or removes a class.
  New: screens fade in, buttons squeeze slightly when pressed, an egg
  wobbles where an animal would hop, the companion hops twice on the
  "step done" screen, and pixel confetti falls when there is news (a new
  level, growth, a badge or a theme) but not on every step, so it stays
  special. celebrate() in rewards.js makes 30 small squares and removes
  them after 2.5 seconds.
  The companion can be given a name in Settings; it is used on its screen
  and in the focus-lock pop-up. On its screen the companion is a button:
  patting it gives a hop and a heart and changes nothing else.
  Every animation is off when the animation switch is off, in plain mode,
  or when the device asks for reduced motion.

- Task 15, longer progression (Claude): Jacob asked for more to work
  toward than one companion reaching 1000 XP. There are now two numbers:
  state.xp (everything ever earned, sets the level, never resets) and
  state.petXp (what the current companion has earned, sets its size).
  When a companion is fully grown, a "Hatch a new egg" button appears on
  the companion screen. The grown one is kept: it joins "Your family" on
  that screen, and a new egg of an animal not raised yet starts growing.
  Raising all six is the long goal (6000 XP). Nothing is lost by hatching
  a new egg; the level and total carry on.
  Seven longer-term badges were added (level 10 and 25, fifty steps, five
  hours, ten tasks, family of three, full house), and reaching a level
  that unlocks a theme is now announced on the "step done" screen.
  Old saves have no petXp, so loadState() sets it to the total.

- Task 14, themes and larger text (Claude): Jacob left the next features
  open, so these are Claude's choices. Five color themes: Paper (the
  original), Night (dark), Forest, Blossom and Sunset. A theme is only a
  different set of values for the color variables in styles.css; app.js
  writes the chosen name onto the <html> element as data-theme and the
  matching block of variables takes over. Paper and Night are free from
  the start so a dark theme is never locked; the other three unlock at
  levels 3, 6 and 10, which gives levels something to lead to. On a first
  visit the app starts in Night if the device is in dark mode. Each choice
  in Settings is painted in its own colors as a preview. "Larger text"
  works the same way with the font-size variables. Contrast was measured
  for all five themes and every pair passes AA.

- Task 13, extras (Claude): two things Claude chose to add.
  (1) Starter step ideas: while the step list is empty, three buttons
  offer a first step ("Open the assignment", "Read the instructions once",
  "Write one messy sentence"). This is aimed at the exact frozen moment
  the project is designed for: an empty list is one more thing to stall
  on. The adding code moved into one function, addStep(), used by both
  the form and the buttons.
  (2) Backup file: Settings can save everything to a file and load it
  again. This stands in for accounts, which need a server. Loading checks
  the file, asks before replacing anything, and re-checks any links in it.
  Also updated docs/unit4-draft.md, which still said the app had no
  points.
  Checked in the browser by script: XP and growth, badges, the companion
  screen, links, the focus lock pop-up, plain mode hiding every reward,
  backup loading, and no sideways scroll at 320px. NOT checked: saving a
  backup file for real, the browser's own "Leave site?" box, opening
  links in a new tab, a screen reader, and browsers other than the
  preview one.

- Task 12, links and focus lock (Claude): Jacob asked for the app to lock
  the browser to the assignment's tabs. A web page is not allowed to see
  or control other tabs, so a true lock is impossible here; it would need
  a browser extension. What was built instead:
  (1) Links: under "Links for this task" on the steps screen the user can
  paste the address of their assignment. The links become "Open ..."
  buttons beside the timer and open in a new tab, so the right page is one
  click away. cleanLink() adds a missing "https://" and rejects text that
  is not a web address.
  (2) Focus lock: leaving a countdown that is still going opens a pop-up
  where the companion asks "Stop here for now?" with "Keep going" and
  "Stop for now". Closing or reloading the tab while the timer counts
  makes the browser show its own "Leave site?" box. Both can be switched
  off in Settings. Leaving is always allowed, nothing is marked as failed,
  and the minutes already spent still earn XP.

- Task 11, companion, XP and badges (Claude): two new files.
  pets.js holds six pixel animals (cat, dog, bunny, fox, frog, duck). Each
  picture is a list of text rows where every character is one pixel, and
  drawPet() paints it on a tiny canvas that CSS stretches. The animal
  colors are CSS variables like every other color.
  rewards.js holds the rules: 10 XP per step, 1 XP per minute the timer
  ran, 20 XP bonus for a whole task, 50 XP per level. The companion grows
  at 0 (egg), 50 (hatchling), 300 (youngster) and 1000 XP (grown-up), so
  the first change is quick and the rest are slow. earn() is the only
  place XP is added, and nothing ever removes it.
  The second reward system is badges (nine of them) plus a list of
  finished tasks and four running totals, all on a new companion screen
  opened from the header. Badges count totals, never "days in a row", so
  none can be broken.
  The companion is picked in Settings and can be changed without losing
  XP. It also sits under the running timer and in the "step done" box.
  Stopping a timer early now still gives XP for the minutes spent.
  Plain mode and the rewards switch hide all of this; XP is still counted
  quietly so nothing is lost when they are switched back on.

- Task 10, GitHub Pages and new rules (Claude): the app was already a
  static website, so nothing in the code had to change to host it. Added
  README.md with the publishing steps, an empty .nojekyll file (tells
  GitHub to serve the files as they are) and a page description.
  AGENTS.md was changed because Jacob's new requests contradicted it: XP,
  levels, badges and a companion are now allowed, but leaderboards,
  penalties and anything that takes progress away are still banned.
  Accounts stay unbuilt because GitHub Pages has no server; a backup file
  replaces them. Published on 2026-11-16 after Jacob approved it:
  https://jacoobius.github.io/task-starter/ (repository
  jacoobius/task-starter, public). Pushing main updates the live site.

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
  Jacob to rewrite in their own words and export to PDF.
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
