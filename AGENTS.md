# Project: ADHD Task Starter (UX class prototype)

## Goal
A small web app that helps adults with ADHD start tasks they're avoiding.

The one constraint this is designed for (Unit 4 brief): a student with
ADHD who has trouble starting tasks sits down to begin a writing
assignment that is due tomorrow. They open the laptop and freeze, because
"write the essay" has no visible first move. Every design choice should
help at that moment.

This is a class prototype, so clarity and readability matter more than
features. The student (me) must be able to understand and explain all code.

## Tech
- Plain HTML, CSS, and JavaScript. No framework, no build step, no backend.
- Data saved in localStorage.
- Must run by opening index.html or a simple static server.

## Core flow (build only this)
1. User types one task they're avoiding.
2. User breaks it into small steps (add, edit, reorder, delete).
3. User starts a step with a large visible countdown timer
   (length is user-chosen, default 10 minutes).
4. On completion, show light positive feedback and offer the next step.

## Design rules
- One main action per screen. Usable within 30 seconds of first opening.
- Gentle feedback only: small completion animation, visible progress
  ("3 of 5 steps done"). NO points, levels, leaderboards, or
  loss/penalty mechanics.
- No shame states: skipped or unfinished steps are never shown as failures.
- Sounds, animations, and rewards must all be user-toggleable, with one
  setting that turns every reward off (for A/B testing plain vs rewarding).
- Accessibility: full keyboard navigation, visible focus, WCAG AA contrast,
  readable type, respects prefers-reduced-motion, proper ARIA labels.
- All colors and fonts live in CSS variables in one place.

## Do NOT build
Accounts, cloud sync, notifications, AI features, mobile app.

## Working rules for ALL agents (Claude Code and Codex)
- Read PLAN.md before starting. Pick only tasks marked "todo" and not
  "in progress." Mark a task "in progress" with your agent name before
  you begin, and "done" when finished.
- Work on your own git branch (claude/<task> or codex/<task>). Never
  commit directly to main. Keep commits small.
- Don't edit files another agent is currently working on. If you must,
  note it in PLAN.md first.
- Do not add dependencies or rewrite existing structure without asking me.
- After each task, add a short plain-English note in PLAN.md: what changed
  and why, so I can understand it.
- If requirements are unclear, ask me instead of guessing.
