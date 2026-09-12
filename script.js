const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");

const imageInput = document.getElementById("imageInput");
const topText = document.getElementById("topText");
const bottomText = document.getElementById("bottomText");
const fontSelect = document.getElementById("fontSelect");
const fontSize = document.getElementById("fontSize");
const strokeSize = document.getElementById("strokeSize");
const textColor = document.getElementById("textColor");
const strokeColor = document.getElementById("strokeColor");
const uppercase = document.getElementById("uppercase");
const sizeSelect = document.getElementById("sizeSelect");
const status = document.getElementById("status");
const themeBtn = document.getElementById("themeBtn");

let image = null;

function setStatus(message) {
  status.textContent = message;
}

function resizeCanvasFromSelect() {
  const [w, h] = sizeSelect.value.split("x").map(Number);
  canvas.width = w;
  canvas.height = h;
  render();
}

function drawBackground() {
  ctx.fillStyle = "#151515";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!image) {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#777";
    ctx.font = `${Math.max(24, canvas.width / 28)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Upload an image to begin", canvas.width / 2, canvas.height / 2);
    return;
  }

  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;

  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function wrapText(text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 5);
}

function drawMemeText(text, y, fromTop = true) {
  if (!text.trim()) return;

  const size = Number(fontSize.value);
  ctx.font = `900 ${size}px ${fontSelect.value}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  ctx.fillStyle = textColor.value;
  ctx.strokeStyle = strokeColor.value;
  ctx.lineWidth = Number(strokeSize.value);

  const finalText = uppercase.checked ? text.toUpperCase() : text;
  const lines = wrapText(finalText, canvas.width * 0.9);
  const lineHeight = size * 1.08;

  let startY = y;
  if (!fromTop) {
    startY = y - lines.length * lineHeight;
  }

  lines.forEach((line, index) => {
    const lineY = startY + index * lineHeight;
    if (ctx.lineWidth > 0) ctx.strokeText(line, canvas.width / 2, lineY);
    ctx.fillText(line, canvas.width / 2, lineY);
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  const padding = Math.max(20, canvas.height * 0.035);
  drawMemeText(topText.value, padding, true);
  drawMemeText(bottomText.value, canvas.height - padding, false);
}

imageInput.addEventListener("change", event => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      image = img;
      setStatus("Image loaded");
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

[
  topText, bottomText, fontSelect, fontSize, strokeSize,
  textColor, strokeColor, uppercase
].forEach(el => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

sizeSelect.addEventListener("change", resizeCanvasFromSelect);

document.getElementById("blankBtn").addEventListener("click", () => {
  image = null;
  setStatus("Blank canvas");
  render();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  image = null;
  imageInput.value = "";
  topText.value = "";
  bottomText.value = "";
  setStatus("Cleared");
  render();
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  render();
  const link = document.createElement("a");
  link.download = `exodus-meme-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  setStatus("PNG downloaded");
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const draft = {
    topText: topText.value,
    bottomText: bottomText.value,
    font: fontSelect.value,
    fontSize: fontSize.value,
    strokeSize: strokeSize.value,
    textColor: textColor.value,
    strokeColor: strokeColor.value,
    uppercase: uppercase.checked,
    size: sizeSelect.value,
    theme: document.body.classList.contains("light") ? "light" : "dark"
  };

  localStorage.setItem("exodusMemeDraft", JSON.stringify(draft));
  setStatus("Draft saved locally");
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const raw = localStorage.getItem("exodusMemeDraft");
  if (!raw) {
    setStatus("No saved draft found");
    return;
  }

  const draft = JSON.parse(raw);
  topText.value = draft.topText ?? "";
  bottomText.value = draft.bottomText ?? "";
  fontSelect.value = draft.font ?? fontSelect.value;
  fontSize.value = draft.fontSize ?? "58";
  strokeSize.value = draft.strokeSize ?? "5";
  textColor.value = draft.textColor ?? "#ffffff";
  strokeColor.value = draft.strokeColor ?? "#000000";
  uppercase.checked = draft.uppercase ?? true;
  sizeSelect.value = draft.size ?? "800x800";

  document.body.classList.toggle("light", draft.theme === "light");
  resizeCanvasFromSelect();
  setStatus("Draft loaded");
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

resizeCanvasFromSelect();


// ------------------------------
// Google Drive media integration
// ------------------------------
const googleClientIdInput = document.getElementById("googleClientId");
const googleApiKeyInput = document.getElementById("googleApiKey");
const saveDriveConfigBtn = document.getElementById("saveDriveConfigBtn");
const connectDriveBtn = document.getElementById("connectDriveBtn");
const pickVideoBtn = document.getElementById("pickVideoBtn");
const closeDrivePlayerBtn = document.getElementById("closeDrivePlayerBtn");
const driveStatus = document.getElementById("driveStatus");
const drivePlayer = document.getElementById("drivePlayer");
const driveNowPlaying = document.getElementById("driveNowPlaying");

let driveAccessToken = null;
let tokenClient = null;
let pickerApiLoaded = false;

function setDriveStatus(text) {
  if (driveStatus) driveStatus.textContent = text;
}

function loadSavedDriveConfig() {
  if (!googleClientIdInput || !googleApiKeyInput) return;
  googleClientIdInput.value = localStorage.getItem("exodusGoogleClientId") || "";
  googleApiKeyInput.value = localStorage.getItem("exodusGoogleApiKey") || "";
}

function saveDriveConfig() {
  const clientId = googleClientIdInput.value.trim();
  const apiKey = googleApiKeyInput.value.trim();

  localStorage.setItem("exodusGoogleClientId", clientId);
  localStorage.setItem("exodusGoogleApiKey", apiKey);
  setDriveStatus("Settings saved");
}

function waitForGoogleLibraries(timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2 && window.gapi) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error("Google libraries did not load. Check your internet connection and reload."));
      }
    }, 150);
  });
}

function loadPickerApi() {
  return new Promise((resolve, reject) => {
    if (pickerApiLoaded) return resolve();

    gapi.load("picker", {
      callback: () => {
        pickerApiLoaded = true;
        resolve();
      },
      onerror: () => reject(new Error("Google Picker failed to load."))
    });
  });
}

async function connectGoogleDrive() {
  const clientId = googleClientIdInput.value.trim();
  const apiKey = googleApiKeyInput.value.trim();

  if (!clientId || !apiKey) {
    setDriveStatus("Enter Client ID + API key first");
    return;
  }

  try {
    setDriveStatus("Loading Google...");
    await waitForGoogleLibraries();
    await loadPickerApi();

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: tokenResponse => {
        if (tokenResponse.error) {
          console.error(tokenResponse);
          setDriveStatus("Google sign-in failed");
          return;
        }

        driveAccessToken = tokenResponse.access_token;
        pickVideoBtn.disabled = false;
        setDriveStatus("Google Drive connected");
      }
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  } catch (error) {
    console.error(error);
    setDriveStatus(error.message || "Could not connect");
  }
}

function openDrivePicker() {
  if (!driveAccessToken) {
    setDriveStatus("Connect Google Drive first");
    return;
  }

  const apiKey = googleApiKeyInput.value.trim();

  const videoView = new google.picker.DocsView(google.picker.ViewId.DOCS);
  videoView.setMimeTypes("video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi,video/mpeg");

  const picker = new google.picker.PickerBuilder()
    .addView(videoView)
    .setOAuthToken(driveAccessToken)
    .setDeveloperKey(apiKey)
    .setCallback(data => {
      if (data.action !== google.picker.Action.PICKED) return;

      const file = data.docs?.[0];
      if (!file?.id) return;

      const safeId = encodeURIComponent(file.id);
      drivePlayer.src = `https://drive.google.com/file/d/${safeId}/preview`;
      driveNowPlaying.textContent = `Now playing: ${file.name || "Google Drive video"}`;
      setDriveStatus("Playing from Google Drive");
    })
    .build();

  picker.setVisible(true);
}

function closeDrivePlayer() {
  drivePlayer.src = "";
  driveNowPlaying.textContent = "No Drive file selected.";
  setDriveStatus(driveAccessToken ? "Google Drive connected" : "Not connected");
}

if (saveDriveConfigBtn) saveDriveConfigBtn.addEventListener("click", saveDriveConfig);
if (connectDriveBtn) connectDriveBtn.addEventListener("click", connectGoogleDrive);
if (pickVideoBtn) pickVideoBtn.addEventListener("click", openDrivePicker);
if (closeDrivePlayerBtn) closeDrivePlayerBtn.addEventListener("click", closeDrivePlayer);

loadSavedDriveConfig();
