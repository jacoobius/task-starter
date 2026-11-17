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
- Hosted as a static website on GitHub Pages (see README.md).
- When styles.css or any .js file changes, raise the "?v=" number on all
  four file links in index.html, so browsers don't mix old and new files.

## Core flow (build only this)
1. User types one task they're avoiding.
2. User breaks it into small steps (add, edit, reorder, delete).
3. User starts a step with a large visible countdown timer
   (length is user-chosen, default 10 minutes).
4. On completion, show light positive feedback and offer the next step.

## Around the core flow (added 2026-11-16 at Jacob's request)
- A pixel-art companion the user picks in Settings. It grows from an egg
  to an adult as the user earns XP.
- XP, levels and badges for finished steps, focused minutes and tasks.
- Links for the task, shown beside the timer, and a "focus lock" that
  asks before the user leaves a running timer.
- A backup file (save/load) in place of accounts.
- Color themes (Paper and Night are free; others unlock by level) and a
  larger-text setting.
- Long-term progression: a fully grown companion joins the "family" and a
  new egg starts. Nothing is ever lost when that happens.
- Animations (confetti, hops, fades). All of them must stay off when the
  animation setting is off, in plain mode, or under reduced motion.
- Timer extras: a bar that empties, quick-length buttons, a break timer.
- Staying power (added 2026-11-17): a guilt-free "welcome back" after
  days away, a "things you started" list, seasonal treasures found on
  any new day (never "in a row"), varied messages, "This step feels too
  big", a user-planned treat, a companion that "works" beside the timer,
  and optional background sound.
- Focus Lock browser extension (added 2026-11-17 at Jacob's request), in
  the extension folder: pauses new page loads except Task Starter and the
  task's links while a timer counts. It must always let the user unlock,
  end by itself, and never touch tabs that were already open.

## Design rules
- One main action per screen. Usable within 30 seconds of first opening.
- Gentle feedback: small completion animation, visible progress
  ("3 of 5 steps done"), plus XP, levels, badges and the growing
  companion. (XP and levels were banned at first; Jacob allowed them on
  2026-11-16.) Still NO leaderboards and NO loss/penalty mechanics: XP,
  levels, badges and growth are never taken away, and nothing shrinks,
  resets or breaks when the user stays away. No streaks that can break.
- No shame states: skipped or unfinished steps are never shown as failures.
- Sounds, animations, and rewards must all be user-toggleable, with one
  setting that turns every reward off (for A/B testing plain vs rewarding).
- Accessibility: full keyboard navigation, visible focus, WCAG AA contrast,
  readable type, respects prefers-reduced-motion, proper ARIA labels.
- All colors and fonts live in CSS variables in one place.

## Do NOT build
Accounts, cloud sync, notifications, AI features, mobile app.
(Accounts and cloud sync need a server, which GitHub Pages does not have.
A web page cannot control other tabs, so the tab lock is a separate
browser extension in the extension folder; see "Around the core flow".)

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
