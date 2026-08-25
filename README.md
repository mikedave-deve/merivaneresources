# Merivane Resources

A remote-first talent agency website — home page, about/story page, a 100-role job board
(80 partner roles + 20 remote roles on the Merivane team itself), a team page, resume
submission, login/register/forgot-password, and a full employee portal with a sidebar.

Built with **Vite + React 18**, **Tailwind CSS**, **Framer Motion**, **React Router**, and
**lucide-react** icons.

## Getting started

```bash
npm install
npm run dev
```

This starts a local dev server (default `http://localhost:5173`) with hot reload.

## Build for production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

The production build is written to `dist/`.

## Project structure

```
src/
  components/         Shared UI: Header, Footer, RoleTicker, JobCard, Logo, Icon…
    ui/               Small primitives: Reveal, CountUp, Marquee, Badge, Buttons, Field
    portal/           Portal-only primitives: RadialProgress, StatCard
  context/
    AppContext.jsx    App-wide state: mock auth (isAuthed) + resume "prefill" role
  data/
    categories.js     Job categories, category icons, titles & requirements per category
    jobs.js           Generates the 100-job roster (80 partner + 20 Merivane remote roles)
    team.js           Team page member data
    testimonials.js   Home page testimonial marquee content
    values.js         "Why Merivane" value cards
    portal.js         Mock data for the employee portal (applications, messages, etc.)
  pages/
    Home.jsx, About.jsx, Jobs.jsx, Team.jsx, SubmitResume.jsx
    Login.jsx, Register.jsx, ForgotPassword.jsx
    portal/
      EmployeePortal.jsx   Sidebar shell + tab switcher
      Dashboard.jsx, PortalJobs.jsx, Applications.jsx, Messages.jsx,
      Documents.jsx, Payroll.jsx, Settings.jsx
  App.jsx             Route table (react-router-dom) + page-transition animation
  main.jsx            Entry point (BrowserRouter + AppProvider)
  index.css           Tailwind directives + custom marquee/scrollbar/focus styles
```

## Backend (Vercel serverless)

The site has a real backend under `api/` (serverless functions) and `lib/` (shared
helpers bundled into them — kept outside `api/` since Vercel's Hobby plan caps
deployments at 12 functions and every file directly under `api/` counts as one).
No persistent server, no local disk storage.

```
api/
  submit-resume.js       POST — validates the resume form, saves the submission to
                          MongoDB Atlas, and emails the recruiter a styled notification.
  resume-upload.js       POST — issues short-lived Vercel Blob upload tokens so the
                          résumé file streams straight from the browser to Blob storage.
  auth/
    register.js          POST — creates an account. The first user ever created becomes
                          an approved admin; everyone after that is a pending employee.
    login.js              POST — verifies credentials, blocks sign-in unless approved,
                          issues a session (httpOnly JWT cookie).
    logout.js             POST — clears the session cookie.
    me.js                 GET — returns the signed-in user for the current session.
    forgot-password.js    POST — emails a 30-minute reset link (always a generic
                          response, so this can't be used to enumerate accounts).
    reset-password.js     POST — verifies the reset token and sets a new password.
  admin/
    employees/index.js    GET — lists employees by status (admin only).
    employees/[id].js     PATCH — approve or reject a pending employee (admin only);
                          approval emails the employee a "you can sign in" notice.
lib/
  mongodb.js              Cached MongoDB Atlas connection (reused across warm invocations).
  email.js                Nodemailer transport + all the HTML email templates.
  auth.js                 Password hashing, session JWTs, cookie helpers, admin guard.
```

**Upload flow:** the browser uploads the résumé directly to Vercel Blob using
`@vercel/blob/client`'s `upload()`, authorized by a token from `/api/resume-upload`.
This bypasses the ~4.5MB request body limit Vercel serverless functions have, and
accepts any file type/size (capped at 15MB in `resume-upload.js`). Once the upload
finishes, the browser posts the form fields + the blob URL as JSON to
`/api/submit-resume`, which writes the record to MongoDB and sends the email.

**Auth flow:** sessions are a JWT in an httpOnly, `SameSite=Lax` cookie (secure flag
set automatically when served over https), signed with `AUTH_SECRET`. There's no
separate roles/admin UI to promote someone — **register your own account first**, on
an empty database, to become the admin. Every registration after that lands as a
pending `employee` until an admin approves or rejects it from `/admin`.

### Environment variables

Copy `.env.example` to `.env` for local development with `vercel dev`, and set the
same variables under Project Settings → Environment Variables in Vercel:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (defaults to `merivane`) |
| `BLOB_READ_WRITE_TOKEN` | Auto-created when you add a Blob store to the Vercel project |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | SMTP credentials (any provider — Gmail app password, SendGrid, Postmark, etc.) |
| `MAIL_FROM` | "From" address for outgoing mail |
| `RECRUITER_EMAIL` | Inbox that receives new resume submissions |
| `AUTH_SECRET` | Random secret that signs session JWTs — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |

### Local development

`vite dev` alone won't serve `/api` routes. Use the Vercel CLI so both the frontend
and the serverless functions run together:

```bash
npm i -g vercel
vercel link      # first time only
vercel env pull  # pulls .env from your Vercel project, if already configured
vercel dev
```

### Deploying

Push to a Git repo connected to Vercel (or run `vercel --prod`). Vercel auto-detects
the Vite frontend and deploys everything in `api/` as serverless functions — no extra
config needed.

## Notes

- **The employee portal's mock data is still mock.** Auth (register/login/approve/reject,
  forgot/reset password) is real and backed by MongoDB — see the Backend section above.
  What's still hardcoded is everything *inside* the portal once you're signed in
  (`src/data/portal.js`'s dashboard stats, missions, payroll, etc.) except the top bar,
  which shows your real name and email.
- **Images are placeholders** from `picsum.photos`, seeded so they stay consistent between
  reloads. Swap in real photography/headshots before launch.
- **Job data is generated**, not fetched — see `src/data/jobs.js`. Replace `buildJobs()`
  with a real API call (or a CMS query) when you have a live jobs backend; the `JobCard`
  and `Jobs` page only expect objects shaped like:
  ```js
  { id, title, category, company, location, type, level, salary, requirements, daysAgo, remote, internal }
  ```
- **Deploying with client-side routing:** this app uses `BrowserRouter`, so your host needs
  to rewrite all paths to `index.html` (a SPA fallback). `vercel.json` at the repo root
  already does this for Vercel (it does **not** happen automatically). On Netlify add a
  `_redirects` file with `/* /index.html 200`; on GitHub Pages or a plain static file
  server you'll either need a rewrite rule or should switch to `HashRouter` in
  `src/main.jsx`.
- **Design tokens** (colors, fonts, shadows) live in `tailwind.config.js` — change the
  `ink` / `brass` / `moss` / `linen` palette there to re-theme the whole site.

## License

Yours to use, adapt, and ship for Merivane Resources.
