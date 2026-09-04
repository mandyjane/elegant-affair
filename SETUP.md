# Stage 1 — Putting Elegant Affair on GitHub Pages

Everything here is a one-time setup. Fifteen minutes, no command line.

---

## ⚠️ Read this first — your existing data will NOT come across automatically

This is the one thing that will catch you out, so it's at the top.

Browsers keep each website's data separately, and they treat a file opened from your
hard drive (`file:///...`) as a **completely different place** from a website
(`https://...`). They are two different origins, and neither can see the other's storage.

So the moment you open the hosted version, it will be **empty**. Your guests, budget,
seating and photos are still safe in the local file — they just aren't visible from the
new address.

**Before you start, and once only:**

1. Open your current planner file the way you normally do
2. Export your data to JSON (Settings → the export/backup option)
3. Finish the setup below
4. Open the hosted app and import that JSON

After that, keep using the hosted version and leave the old file alone as a backup.

**Also worth knowing for now:** your phone and your laptop are also separate storage. Until
Stage 2 adds accounts and cloud save, installing on both devices gives you two independent
planners. Stage 1 fixes how you *get* to the app; it does not yet share data between
devices. That's the next stage.

---

## What's in this folder

```
index.html                     the app itself
manifest.webmanifest           tells the phone its name, icon and colours
sw.js                          service worker — makes it work offline
icons/icon-192.png
icons/icon-512.png
icons/icon-maskable-512.png    the version Android crops to a circle
icons/apple-touch-icon.png     the version iPhones use
```

Keep this exact structure. The file names and the `icons/` folder are referenced by name —
renaming anything will quietly break the icon or the offline support.

---

## 1. Create the repository

1. Go to github.com and sign in (create a free account if you don't have one)
2. Click **+** (top right) → **New repository**
3. Name it something like `elegant-affair`
4. Set it to **Public**
5. Click **Create repository**

**Why public:** GitHub Pages only publishes from private repositories on a paid plan. Public
is fine here — the repository contains the app's *code*, and none of your wedding data. Your
guest list lives in your browser, never in this repository. Anyone finding the URL sees an
empty planner, not yours.

## 2. Upload the files

1. On the new repository page, click **uploading an existing file**
2. Drag in `index.html`, `manifest.webmanifest` and `sw.js`
3. Drag the `icons` folder in as well — GitHub keeps the folder structure
4. Scroll down and click **Commit changes**

## 3. Turn on Pages

1. Click **Settings** (top of the repository)
2. **Pages** in the left sidebar
3. Under *Source*, choose **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)** → **Save**
5. Wait a minute or two, then refresh. A green banner shows your address:

```
https://YOUR-USERNAME.github.io/elegant-affair/
```

That address is now the app, on any device, forever.

## 4. Install it

**iPhone / iPad** — must be Safari, not Chrome:
open the address → Share button → **Add to Home Screen** → Add.

**Android** — Chrome:
open the address → menu (⋮) → **Install app** (or *Add to Home screen*).

**Laptop** — Chrome or Edge:
open the address → the install icon in the address bar → **Install**.

It gets the EA monogram, opens without browser chrome, and works with no signal.

## 5. Import your data

Open the installed app and import the JSON you exported at the top of this guide.

---

## Updating the app later

When you have a new version:

1. In the repository, click `index.html` → the pencil icon → delete the contents and paste
   the new file (or delete the file and upload the replacement)
2. Open `sw.js`, find this line near the top, and increase the number:

   ```js
   const CACHE_VERSION = 'ea-v168';
   ```

3. Commit

**Step 2 matters.** The service worker keeps a copy of the app so it can start instantly and
work offline. If you don't change that line, it will keep serving the copy it already has and
you'll wonder why your update never appeared. Changing it throws the old copy away.

Even with the bump, the app updates on the *second* launch after a change — the first launch
shows the old version while quietly downloading the new one in the background. That's the
deliberate trade for a 3.7 MB app that has to start instantly and survive having no signal.
Open it, close it, open it again.

---

## If something looks wrong

**Icon is a blank page or the wrong image** — the `icons/` folder didn't upload with its
structure. Check the repository shows `icons/icon-192.png`, not `icon-192.png` at the root.

**"Add to Home Screen" is missing on iPhone** — you're in Chrome. iOS only allows this from
Safari.

**Changes aren't showing** — you didn't bump `CACHE_VERSION`, or you've only opened it once
since. See above.

**The app is empty** — expected on first open. Import your JSON. See the warning at the top.

**Page won't load at all** — Pages can take a few minutes on the first publish. Check
Settings → Pages for the green "Your site is live" banner.

---

## What Stage 2 adds

Accounts and cloud save/load via Supabase, so the phone and the laptop finally hold the same
planner and the export/import step disappears for good.
