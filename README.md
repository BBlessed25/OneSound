# Attendance Registrar

A fast, mobile-friendly attendance app. Tap **Present** or **Absent** for each
person and the response is appended to a **Google Sheet in real time** — no
submit button.

Built with the requested stack:

| Concern | Tool |
| --- | --- |
| Web framework / SSG | **Nuxt 3** |
| UI library | **Vue 3** |
| State | **Pinia** |
| Styling | **Tailwind CSS** |
| Animation | **GSAP** |
| Smooth scroll | **Lenis** |
| Hosting (PaaS) | **Vercel** |
| Metadata | **Open Graph** tags |

> Sentry, Segment, Facebook Pixel and Sanity are easy to layer on later, but
> aren't required for the core attendance flow, so they're left out for now.

## 1. Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without a Google Script URL the app works fully for marking attendance; only the
**Submit to Sheets** step needs the configuration below.

## 2. Connect a Google Sheet

1. Create a new Google Sheet.
2. **Extensions → Apps Script**, delete the placeholder, and paste the contents
   of [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. (Optional) set a `SHARED_SECRET` at the top of that file.
4. **Deploy → New deployment → Web app**
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
5. Copy the generated **Web app URL** (ends in `/exec`).

## 3. Configure the app

```bash
cp .env.example .env
```

Edit `.env`:

```bash
NUXT_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
NUXT_GOOGLE_SCRIPT_SECRET=   # only if you set SHARED_SECRET
```

Restart `npm run dev`. Now **each Present/Absent tap** instantly appends a row:

| Taken At | Name | Phone | Email | Location | Status |
| --- | --- | --- | --- | --- | --- |

The status bar shows "Syncing…" while a tap is being saved and "Synced to
Google Sheets" once done. Tapping the active button again un-marks it locally
(no row is sent); "All present" sends everyone in one batch.

## 4. Deploy to Vercel

1. Push this folder to a Git repo and import it on [vercel.com](https://vercel.com),
   **or** run:

   ```bash
   npm i -g vercel
   vercel
   ```

2. In the Vercel dashboard → **Project → Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `NUXT_GOOGLE_SCRIPT_URL` | your Apps Script `/exec` URL |
   | `NUXT_GOOGLE_SCRIPT_SECRET` | (optional) same value as in `Code.gs` |

3. Redeploy. The forwarding to Google Sheets runs in the Nuxt/Nitro server
   function on Vercel, so your script URL stays private (never exposed to the
   browser).

## Project structure

```
app.vue                       # Main screen (header, stats, list, submit bar)
components/AttendeeCard.vue    # Person row with Present/Absent buttons
stores/attendance.ts          # Pinia store (statuses, filters, submit)
data/attendees.ts             # The attendee list
server/api/attendance.post.ts # Forwards records to Apps Script
plugins/lenis.client.ts       # Lenis + GSAP smooth scrolling
google-apps-script/Code.gs    # Paste into Google Apps Script
```

## Editing the attendee list

Edit [`data/attendees.ts`](data/attendees.ts). Each entry needs a unique `id`,
`name`, `phone`, `email`, and `location`.
