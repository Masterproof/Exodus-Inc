# Exodus Meme Forge

A static meme-generator starter website designed to work on GitHub Pages.

## Features

- Upload an image from your computer or phone
- Top and bottom meme text
- Font, size, outline, text color controls
- Multiple canvas sizes
- Download finished meme as PNG
- Local browser draft saving with localStorage
- Dark/light theme
- Responsive layout
- No backend required

## Run locally

Double-click `index.html`.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, and `script.js`.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. GitHub will give you your public `github.io` address.

This starter site does not require Node.js, npm, a database, or an API key.


## Google Drive Media Setup

This version includes an optional Google Drive picker and embedded Drive preview player.

You need to create your own Google Cloud project and credentials:

1. Go to https://console.cloud.google.com/
2. Create/select a project.
3. Enable **Google Picker API** and **Google Drive API**.
4. Configure the OAuth consent screen.
5. Create an **OAuth 2.0 Client ID** for a Web application.
6. Add your GitHub Pages origin under **Authorized JavaScript origins**, for example:
   `https://YOUR-USERNAME.github.io`
7. Create a Google API key and restrict it to your GitHub Pages site and the APIs you use.
8. Open your website and paste the Client ID and API key into the Google Drive Media section.
9. Click **Save Drive Settings → Connect Google Drive → Choose Movie / Cartoon**.

The selected video stays in Google Drive. The site embeds Google's own Drive preview player, so large video files are not added to the GitHub repository.

Use this only for media you own or are authorized to access/stream.
