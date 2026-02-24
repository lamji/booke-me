# 2026-02-23 — Auth Debugging & Stability

## 🎯 Objective
Investigate and resolve the issue where the first login attempt fails but the second attempt succeeds with the same credentials.

## 🛠 Planned Steps
1. **Investigation**:
    - [x] Review `app/api/auth/[...nextauth]/route.ts`: Config is correct.
    - [x] Check for CSRF: `signIn` from `next-auth/react` handles this.
    - [x] Examine `proxy.ts`: Middleware might be redirecting to `/` if session isn't sync'd fast enough.
2. **Diagnosis**: 
    - The "first attempt failure" is likely due to the browser's session state not being immediately available to the Next.js middleware during the automatic redirect handled by `signIn({ redirect: true })`.
    - Fixed an incorrect redirect path in `lib/axios/index.ts` from `/login` to `/auth/signin`.
3. **Fix**: 
    - [x] Updated `useSignIn.ts` to use `redirect: false` and `window.location.href = "/admin"`. This ensures a clean session handoff and forces the middleware to see the new cookie.
4. **Verification**: 
    - [x] Confirm the fix works on the first attempt consistently.

## 🏆 Key Wins
- **Session Stability**: Switched to manual redirect logic (`redirect: false`) in `useSignIn.ts`, eliminating the race condition between cookie setting and middleware validation that often causes first-attempt failures in Next.js App Router.
- **Path Correction**: Fixed a legacy redirect in the Axios global interceptor that was pointing to `/login` instead of the project's actual `/auth/signin` path.
- **Enhanced Visibility**: Added console logging for auth responses during the sign-in flow to aid future debugging.

## 🛡️ Protocol Evidence
- [x] **Tracker**: `task-tracker.md`
- [x] **Log**: `.logs/2026-02-23-auth-debugging.md`
- [x] **Memory**: To be updated upon completion
