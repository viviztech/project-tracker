# Fix Network Error and Cross-Site Cookie Issue

The "Network Error" on login is primarily caused by two issues:
1.  **CORS:** The backend was not expecting requests from the deployed frontend URL.
2.  **Cookies:** The backend attempts to set a cookie with `SameSite: lax` and `secure: false`. Since your frontend and backend are on different subdomains (traefik.me), browsers require `SameSite: none` and `secure: true` for the cookie to be accepted.

## User Review Required
> [!IMPORTANT]
> You **MUST** ensure your **Backend Container** has the environment variable `CLIENT_URL` set to your frontend URL.
> `CLIENT_URL=https://project-tracker-frontend-kkm3lr-454f34-91-108-110-202.traefik.me`
> If this is missing, the backend will reject the connection (CORS error).

## Proposed Changes

### Server
#### [MODIFY] [generateToken.js](file:///Users/ganeshthangavel/Sites/baskar/server/utils/generateToken.js)
- Update cookie settings to be dynamic based on environment.
- In production, set `secure: true` and `sameSite: 'none'`.

## Verification Plan

### Manual Verification
1.  **Rebuild Backend:** `docker-compose up -d --build server` (or your equivalent command).
2.  **Rebuild Frontend:** `docker-compose up -d --build client` (to apply the `.env` change I made earlier).
3.  **Check Login:** Go to your live frontend URL and try to login.
4.  **Verify Cookie:** Inspect the Network tab -> Login request -> Cookies. You should see the `jwt` cookie being set with `Secure` and `SameSite=None`.
