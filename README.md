# Subleasing Solutions — MVP

The **Find a place** tab and the **listing details** page from the Figma prototype, built so anyone can use it.
People who want to sublease click **Request to sublease** and submit their Cal Poly email. Each request
lands in a Google Sheet your team shares. From there you verify both students and connect them by email.

```
src/
  data/listings.ts        ← EDIT THIS to add your real listings
  config.ts               ← site settings (read from environment variables)
  components/             ← Browse page, listing details, request form, map
apps-script/Code.gs       ← paste into Google Apps Script to save requests to a Sheet
```

---

## 1. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. If you haven't set up the Google Sheet yet, requests are saved only in your
browser and logged to the console, which is fine for testing.

## 2. Save requests to a Google Sheet (5 min)

1. Create a Google Sheet, for example *Subleasing Solutions – Requests*, and share it with your team.
2. In the sheet, open **Extensions → Apps Script**. Replace the sample code with the contents of `apps-script/Code.gs`.
3. Optional: set `NOTIFY_EMAIL` at the top so you get an email for every new request.
4. Click **Deploy → New deployment**, choose the gear icon, then **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, approve the permissions, and copy the **Web app URL** (it ends in `/exec`).
6. Paste the URL into your environment (see below):

```bash
cp .env.example .env.local
# then set VITE_REQUESTS_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
```

To check that it works, open the `/exec` URL in a browser. You should see `{"ok":true,...}`. Then submit a test
request on the site. A **Requests** tab appears in your sheet with these columns: time, status, listing,
email, name, dates, and note.

> The **Status** column starts as `New`. Change it to `Verifying`, `Connected` or `Declined` as you work
> each request.

## 3. Put it online (free)

### Option A — Vercel (recommended)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new and import the repo. Vercel detects the Vite settings on its own.
3. Under **Environment Variables**, add `VITE_REQUESTS_ENDPOINT`, plus `VITE_SURVEY_URL` and `VITE_CONTACT_EMAIL` if you want them.
4. Click **Deploy**. You get a public URL like `subleasing-solutions.vercel.app`.

Or from the terminal:

```bash
npm i -g vercel
vercel          # first deploy, follow the prompts
vercel env add VITE_REQUESTS_ENDPOINT
vercel --prod
```

### Option B — Netlify

1. Go to https://app.netlify.com/start and import the repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Add the environment variables under **Site configuration → Environment variables**, then redeploy.

> Environment variables are baked in when the site is built. **Redeploy after changing them.**

## 4. Add your real listings

Open `src/data/listings.ts` and replace the four `[SAMPLE]` listings. Each listing has a comment explaining
its fields. Some notes:

- **Photos:** put files in `public/listings/` and reference them as `'/listings/room1.jpg'`.
- **Map pins** use `lat`/`lng`. Use an *approximate* spot, not the real address. In Google Maps, right-click a
  nearby corner to copy its coordinates.
- Filter tags (amenities, household, verification, room type, roommates) must match the options in
  `FILTER_GROUPS` at the bottom of the file.
- When a listing is filled, set `hidden: true` to take it down. Any shared links will show "This listing isn't available."
- Commit and push. Vercel or Netlify will redeploy on its own.

Each listing gets a shareable link like `https://your-site/#/listing/monterey-heights-private-room`.

## Settings (environment variables)

| Variable | What it does |
|---|---|
| `VITE_REQUESTS_ENDPOINT` | Apps Script web app URL. Required for requests to reach your Sheet. |
| `VITE_SURVEY_URL` | Optional feedback survey link. Appears in the header, the footer, and the "Request sent" screen. |
| `VITE_CONTACT_EMAIL` | Optional team inbox shown in the footer and in error messages. |
| `VITE_REQUIRE_CALPOLY_EMAIL` | `true` by default. Only accepts `@calpoly.edu` emails. Set to `false` to accept any email. |

## What's in vs. out of this MVP

**In:** Find a place (date search, max price, filters, sorting, a live map with price pins), listing details
(availability compared to your dates, cost estimate, host checks), the request form (email, optional name,
dates, note, consent), storage in Google Sheets, a "Request sent" state that remembers which listings you
requested, and an optional survey link.

**Not in (done by the team by hand):** verifying Cal Poly IDs against the directory, emailing both parties to
connect them, and posting listings (the team adds them to `listings.ts`). The prototype's Messages, My
subleases, and Post a sublease screens are not included.
