# Functionality repair — same application design

## Required setup before this can work live

1. **Revoke and replace the Firebase service-account key committed in this repository.** The updated source deletes the credential JSON and tracked `.env` files. They still exist in old Git commits; deleting a file does not revoke it. Review/rotate any other credentials in those old `.env` files. Do not reuse them.
2. Create a Groq API key at https://console.groq.com/keys using the Free plan. Free usage has quotas, not unlimited capacity; actual account limits are at https://console.groq.com/settings/limits. Do not enable paid billing if you want to stay free.
3. Use Node.js 20 or newer. Copy `backend/.env.example` to `backend/.env`. Set `GROQ_API_KEY`, the new `FIREBASE_SERVICE_ACCOUNT` JSON, and `FIREBASE_PROJECT_ID`. Alternatively use standard application-default credentials on the host. Never use a REACT_APP_ prefix for server credentials.
4. Copy root `.env.example` to `.env` and add your Firebase web-app configuration and backend URL. Frontend Firebase values are public identifiers; enforce Firestore rules on user-owned documents. Preserve the existing Firebase project and user accounts.
5. Install with `npm install` in the root and backend. Start backend with `npm start` in backend, then frontend with `npm start` in root. The existing repo includes tracked backend dependencies; do not deploy or commit new node_modules. A later dependency cleanup can remove those from Git.
6. Configure `FRONTEND_URLS` on the backend for the deployed frontend origin. Build the frontend with the real `REACT_APP_API_URL` and Firebase web configuration. Use an SPA fallback (the included `public/_redirects` supports Netlify).

## Repairs

- All generation/grading now uses server-side Groq, default `llama-3.3-70b-versatile`, with JSON mode, response validation, timeout, and actionable quota/configuration errors. No paid fallback.
- Curriculum data retains level and timeline, validates all requested weeks and returns exactly three choices. Long timelines use more quota and may need a later retry when the account limit is reached.
- Lessons, quizzes and projects generate on demand and reuse Firestore cache. Empty old quizzes/projects are regenerated. No empty result is silently cached after generation failure.
- Removed fragile word-overlap filters and prompt-template parsing that rejected valid questions or broke grading code containing braces.
- Short questions omit an empty options array so the existing UI shows the text field. A grading outage does not record a zero score.
- One frontend API helper sends Firebase ID tokens to the configured backend, checks HTTP failures and preserves server error messages. Backend requests reject missing sessions and mismatched user IDs.
- Removed unreachable duplicate enrollment handler that attempted eager generation. Enrollment errors no longer look like success.
- Lesson request cleanup prevents stale responses after switching lessons; errors offer retry instead of invented content. Dashboard lesson modal now uses the real lesson endpoint and correct component props. Course/module metadata reaches project grading.
- Initial auth loading is respected; progress cache keys are account-scoped.
- Basic per-user request protection is in memory per server instance. For larger public traffic, configure a shared rate limiter; Groq enforces its own account quota independently.

## Verification and limits

`npm test` in backend runs mocked provider, schema, quota, grading and authentication tests. `npm run build` in root verifies the unchanged frontend design compiles. No live AI calls or database writes were made using real credentials. End-to-end live sign-in, lesson generation, persistence and AI quality must be verified after the new keys and deployment configuration are set.

This is a focused generation/chat repair, not a claim that every legacy placeholder route, feature or database access rule has been fully audited.

Browser verification also passed with mocked Firebase login and a mocked generation response: the unchanged frontend sent an authenticated request and rendered the returned learning path. This verifies wiring, not live provider quality or database access.
