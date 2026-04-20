# Deploy Guide — Trampo

This project is a standard **Vite + React + TypeScript + Supabase** app. It has zero
runtime dependency on Lovable: the only Lovable package is `lovable-tagger`, which is
loaded **only in development** (see `vite.config.ts`) and stripped from production builds.

## 1. Prerequisites

- Node.js 20+ and npm (or bun)
- A Supabase project (https://supabase.com → New Project)
- A Vercel account (or any static host: Netlify, Cloudflare Pages, etc.)

## 2. Set up your Supabase project

1. Run database migrations from `supabase/migrations/` against your new project:
   ```bash
   npx supabase login
   npx supabase link --project-ref <YOUR_PROJECT_REF>
   npx supabase db push
   ```
2. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy generate-application-email
   ```
3. In the Supabase dashboard:
   - **Storage** → create a private bucket called `resumes`
   - **Authentication → URL Configuration** → set Site URL and Redirect URLs to your
     production + preview domains
   - **Edge Functions → Secrets** → add the API key your `generate-application-email`
     function needs (e.g. an OpenAI/Gemini key under `LOVABLE_API_KEY` or rename it
     and adjust the function code)

## 3. Local development

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
npm install
npm run dev
```

## 4. Production build

```bash
npm run build      # outputs static files to ./dist
npm run preview    # serve the build locally to verify
```

## 5. Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project** → import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
4. **Environment Variables** — add the three from `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
5. Deploy. Vercel handles SPA routing automatically for Vite projects.

## 6. Security checklist

- ✅ Only the **anon / publishable** key is shipped to the browser. Never put the
  `service_role` key in `.env` or any frontend code.
- ✅ Every table has Row-Level Security enabled with explicit policies.
- ✅ The `companies.cnpj` and `companies.whatsapp` columns are protected by a
  column-level grant; sensitive fields are fetched via the `get_company_private` RPC.
- ✅ `profiles.user_type` and `profiles.plan` cannot be self-elevated — the
  `prevent_profile_role_escalation` trigger blocks non-admin updates.
- ✅ Daily application limits (5 free / 30 premium) are enforced server-side.

## 7. Notes on leaving Lovable

- The `lovable-tagger` dev plugin is harmless in production but you can remove it
  if you want a 100% Lovable-free repo:
  ```bash
  npm uninstall lovable-tagger
  ```
  Then delete the `componentTagger` import and the entry in `plugins: [...]`
  inside `vite.config.ts`.
- The `src/integrations/supabase/client.ts` and `types.ts` files are normal
  TypeScript — they will keep working outside Lovable. To regenerate `types.ts`
  against your own Supabase project, run:
  ```bash
  npx supabase gen types typescript --project-id <YOUR_PROJECT_REF> > src/integrations/supabase/types.ts
  ```
