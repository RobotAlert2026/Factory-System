# Factory Systems Hub: Firebase setup

The dashboard reads its shared links from Firestore document `portal/config`.
Link data is publicly readable, but only users explicitly listed in the
Firestore `admins` collection can change it. Firebase Authentication users
cannot grant themselves admin access.

## Languages

The dashboard interface supports Thai, English, and Simplified Chinese. The
language selector is in the header, and the selected language is saved in the
current browser. Administrators can enter each link description in all three
languages. Older links with only a `desc` field continue to work; built-in
descriptions use their translations, and custom descriptions fall back to the
text already entered.

## One-time Firebase setup

1. In Firebase Console for project `factory-system-eeae9`, create a Firestore
   database.
2. In **Authentication → Sign-in method**, enable **Email/Password**. Add each
   authorized account yourself in **Authentication → Users → Add user**; this
   page does not provide account registration.
3. Copy the new user's UID from Authentication. In Firestore, create a document
   in collection `admins` whose document ID is exactly that UID. An `email`
   string field is optional and is only for administrator reference. Repeat
   for each person allowed to edit.
4. Deploy `firestore.rules` from this project folder using Firebase CLI:

   ```powershell
   firebase login
   firebase deploy --only firestore:rules
   ```

5. In **Authentication → Settings → Authorized domains**, add the hostname
   serving this page (for example, the GitHub Pages hostname). Serve the page
   over HTTPS or from `localhost`; opening it directly as a `file://` URL is not
   supported for Firebase modules.

## Data and access model

- `portal/config` stores the shared `links` array and is readable by dashboard
  visitors. Firestore rules require a matching `admins/{uid}` document and
  validate the document fields, administrator UID, server timestamp, and a
  maximum of 100 links. The application also validates link fields, allowed
  categories, statuses, icons, URL schemes, description lengths, and duplicate
  IDs before saving.
- Firestore Security Rules cannot iterate over every item in an array. Per-link
  field validation therefore runs in the application; the rules enforce the
  outer document shape and list limit. For stronger database-side validation of
  each link, the storage model would need to change to one Firestore document
  per link.
- `online` and `offline` are administrator-managed labels, not automatic
  connectivity checks.
- Admin documents can only be provisioned or removed by a project owner in
  Firebase Console. Client-side code cannot grant admin privileges.
- Firebase web configuration, including the API key in `app.js`, identifies
  the Firebase project; it is not an authorization mechanism. Keep the deployed
  Firestore rules in place to protect writes.
- If `portal/config` does not exist, the first authorized administrator to open
  the page seeds it once from that browser's saved `localStorage` links, or
  from the built-in starter list if there are no saved links. A Firestore
  transaction prevents this initial migration from overwriting a document
  created concurrently by another administrator.

## Automated tests

The dependency-free browser tests cover legacy data compatibility, translated
descriptions, duplicate IDs, URL schemes, status/category/icon validation, and
link and description limits. Serve the project over HTTP (for example with the
VS Code Live Server extension), then open `tests/link-data.test.html`. All
checks should report `PASS`.
