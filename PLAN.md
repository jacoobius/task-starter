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
| 1  | Page skeleton: index.html, styles.css, app.js, with all colors and fonts as CSS variables in one place | todo | |
| 2  | Screen 1: type one task you're avoiding | todo | |
| 3  | Screen 2: break the task into steps (add, edit, reorder, delete) | todo | |
| 4  | Save and load the task and steps with localStorage | todo | |
| 5  | Screen 3: large countdown timer for one step (user-chosen length, default 10 minutes) | todo | |
| 6  | Completion: gentle feedback, progress ("3 of 5 steps done"), offer the next step | todo | |
| 7  | Settings: toggles for sound, animation, rewards, plus one switch that turns all rewards off | todo | |
| 8  | Accessibility pass: keyboard navigation, visible focus, AA contrast, reduced motion, ARIA labels | todo | |

## Notes
(Newest first. One short entry per finished task: what changed and why.)

- Project setup (Claude): created AGENTS.md, CLAUDE.md and this PLAN.md, and
  initialised git, so both agents share the same rules and task list.
