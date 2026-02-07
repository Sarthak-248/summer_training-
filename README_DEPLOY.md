# Deploying the frontend as a Render Static Site

Follow these steps to deploy the `client/` app as a static site on Render and point it at the backend:

1. Create a new Static Site on Render
   - In Render: New → Static Site
   - Connect your GitHub repo and choose the `master` (or `main`) branch

2. Build & publish settings
   - Build command: `npm install --prefix client && npm run build --prefix client`
   - Publish directory: `client/dist`

3. Environment variables (important)
   - Add `VITE_API_URL` and set it to your backend URL, e.g. `https://healthcard-backend-zsx7.onrender.com`
   - Optionally add other public-facing values used at build time.

4. Trigger deploy
   - Save and either trigger a manual deploy or push to the branch to start an auto-deploy.

5. Verify
   - After deployment, visit the Render static site URL.
   - Run the smoke-test script in this repo (see `scripts/smoke-test.sh`) or run the curl checks in your terminal.

Notes
 - `VITE_API_URL` is read at build time by Vite; set it in Render so the production build is wired to your backend.
 - Do NOT commit secrets (API keys, DB passwords) to the repo — put them in Render environment variables for services that need them.
