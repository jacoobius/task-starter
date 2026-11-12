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
| 3  | Screen 2: break the task into steps (add, edit, reorder, delete) | todo | |
| 4  | Save and load the task and steps with localStorage | todo | |
| 5  | Screen 3: large countdown timer for one step (user-chosen length, default 10 minutes) | todo | |
| 6  | Completion: gentle feedback, progress ("3 of 5 steps done"), offer the next step | todo | |
| 7  | Settings: toggles for sound, animation, rewards, plus one switch that turns all rewards off | todo | |
| 8  | Accessibility pass: keyboard navigation, visible focus, AA contrast, reduced motion, ARIA labels | todo | |

## Notes
(Newest first. One short entry per finished task: what changed and why.)

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
