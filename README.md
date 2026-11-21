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
| `pets.js` | The pixel pictures of the companions and treasures, and the code that draws them |
| `rewards.js` | XP, levels, badges, treasures, themes and the companion screen |
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

## The Focus Lock extension (optional)

A web page is not allowed to control other browser tabs, so blocking
other websites needs a small browser extension. It lives in the
`extension` folder. With it installed, while a Task Starter timer is
counting, every new page you open is paused unless it is Task Starter
or one of the links you saved for the task.

It is gentle on purpose:
- The paused page offers "Back to Task Starter", "Allow this site for
  this timer" and "Unlock all sites now".
- The lock ends by itself when the timer ends or is paused, when you
  close the Task Starter tab, when you restart the browser, and after
  3 hours at most.
- Tabs you already had open are never touched, so no work is lost.
- It can be switched off in Task Starter's Settings ("Pause other
  websites during the timer").

### Install it (Chrome or Edge)

1. Download this project and unzip it, if you haven't already.
2. Open `chrome://extensions` (or `edge://extensions` in Edge).
3. Turn on "Developer mode".
4. Click "Load unpacked" and choose the `extension` folder.
5. Reload the Task Starter page. Settings should now say the extension
   is installed.

Chrome will say the extension can "Read your browsing history". That is
because it has to see the address of each page you open to decide
whether to pause it. It never saves or sends those addresses anywhere.

The extension works with the live site and with a copy served from
`http://localhost`. It does not work when `index.html` is opened by
double-clicking it. To put it in the Chrome Web Store you would need a
developer account (a one-time $5 fee) and Google's review.

### If it doesn't seem to work

1. **After an update, reload it.** On `chrome://extensions`, press the
   circular reload arrow on "Task Starter Focus Lock", then reload the
   Task Starter page.
2. **Check Settings.** It should say the extension is installed. If it
   doesn't, the page was opened before the extension was loaded: reload
   the page.
3. **Start the countdown.** The lock begins only when you press "Start
   timer", not when the timer screen opens. While it is on, the timer
   screen says "Other websites are paused until the timer ends". That
   line appears only after the extension confirms the lock.
4. **New tabs themselves are allowed.** Opening a new, empty tab is
   fine; the site you then go to in it is what gets paused.
5. **Look for errors.** On `chrome://extensions`, an "Errors" button on
   the extension's card lists anything that went wrong.

### Extension files

| File | What it holds |
|------|---------------|
| `manifest.json` | The extension's name, permissions and files |
| `bridge.js` | Runs inside the Task Starter page and passes messages to the extension |
| `background.js` | Decides which pages to pause, and ends the lock |
| `blocked.html`, `blocked.js`, `blocked.css` | The "Paused while you focus" page |
