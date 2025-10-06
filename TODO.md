# TODO: Fix 400 Bad Request Errors on Login and Register

## Information Gathered
- Backend auth routes are implemented correctly with password hashing and validation.
- Frontend sends correct JSON payloads for register (email, password, username, name) and login (email, password).
- Server uses express.json() for body parsing and CORS is configured.
- User model has pre-save hook for hashing passwords and comparePassword method.

## Plan
- Added console logging in backend/routes/auth.js to debug request bodies and logic flow.
- User needs to restart the backend server to apply logging changes.
- Test register/login and check backend console logs to identify the cause of 400 errors.

## Dependent Files Edited
- backend/routes/auth.js: Added logging for request bodies, user existence, password validation.

## Followup Steps
1. Restart the backend server (e.g., cd backend && npm start).
2. Try registering a new user with unique email and username.
3. Check backend console logs for the request body and any errors.
4. If "User already exists", use a different email/username.
5. If "User not found" for login, ensure the email is correct.
6. If "Password valid: false", the user may have been created before password hashing; drop the users collection in MongoDB.
7. Ensure MongoDB is running (mongod command).
8. If logs show correct body but still 400, check for database connection issues.

## Confirmation
Please restart the backend and test the auth endpoints, then provide the console logs if issues persist.
