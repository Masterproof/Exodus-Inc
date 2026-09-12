# Exodus Inc V3

Static GitHub Pages website with:

- Meme generator
- Funny caption presets/categories
- Internet image search using Wikimedia Commons
- Optional AI image generation using a user-supplied Pollinations API key
- Google Drive video picker/player
- Responsive tabbed interface so panels do not overlap

## Publish

Upload these files to the root of the `Masterproof/Exodus-Inc` repository:

- `index.html`
- `style.css`
- `script.js`
- `README.md`

Then commit the changes. GitHub Pages will redeploy automatically if Pages is already enabled.

## Google Drive configuration

In Google Cloud:

1. Enable Google Drive API and Google Picker API.
2. Create a Web OAuth Client ID.
3. Authorized JavaScript origin: `https://masterproof.github.io`
4. If the OAuth app is in Testing, add your Google account under Audience → Test users.
5. Create a regular API key.
6. Website restrictions:
   - `https://masterproof.github.io/*`
   - `https://docs.google.com/*`
7. Restrict the API key to Google Drive API and Google Picker API.
8. Find the Project Number under IAM & Admin → Settings. That Project Number is used as the Google Picker App ID.
9. On the website, enter OAuth Client ID, API key, and Project Number.

## Important

GitHub Pages is static. Do not hard-code private paid API keys into the repository.
The AI image tab stores a user-entered key only in that browser's local storage.
Use only media and images you have the right to use.


## V4 Google config

V4 adds `google-config.js`.

Edit only that file for Google Drive:

```js
window.EXODUS_GOOGLE_CONFIG = {
  clientId: "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com",
  apiKey: "YOUR_GOOGLE_API_KEY",
  appId: "YOUR_GOOGLE_PROJECT_NUMBER"
};
```

Then upload/replace these files in GitHub:

- `index.html`
- `style.css`
- `script.js`
- `google-config.js`
- `README.md`

The Drive tab no longer asks you to type credentials.

### Security note

GitHub Pages is static and public. `google-config.js` is not secret.
Restrict the Google API key to your website and only the required APIs.
