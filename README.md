# Task Starter

A small website that helps you start a task you've been avoiding. Type
the task, break it into small steps, start one step with a countdown
timer, and grow a pixel companion as you go.

It is plain HTML, CSS and JavaScript. There is nothing to install and
nothing to build.

## Files

| File | What it holds |
|------|---------------|
| `index.html` | Every screen of the app |
| `styles.css` | All styling. Colors and fonts are variables at the top |
| `pets.js` | The pixel pictures of the companions, and the code that draws them |
| `rewards.js` | XP, levels, badges and the companion screen |
| `app.js` | The task, steps, timer, settings and saving |

## Run it on your computer

Double-click `index.html`. It opens in your browser and works offline.

## Put it on the web with GitHub Pages

1. Create a new repository on github.com (it must be public on a free
   account).
2. Push this project to it:

   ```
   git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
   git push -u origin main
   ```

3. On github.com open the repository, then Settings, then Pages.
4. Under "Build and deployment" choose "Deploy from a branch", pick the
   `main` branch and the `/ (root)` folder, and press Save.
5. After a minute or two the site is live at
   `https://YOUR-NAME.github.io/YOUR-REPO/`.

Everything in the repository becomes public, including `AGENTS.md`,
`PLAN.md` and the `docs` folder.

## Where your data lives

Everything (your task, steps, XP and companion) is saved in your own
browser, using localStorage. Nothing is sent anywhere, and there are no
accounts. To move your progress to another browser or computer, use
"Save a backup file" and "Load a backup file" in Settings.

## What it cannot do

A web page is not allowed to control other browser tabs, so the app
cannot block other websites. The "focus lock" asks before you leave a
running timer, and that is as far as a website can go. A real tab lock
would need a browser extension.
