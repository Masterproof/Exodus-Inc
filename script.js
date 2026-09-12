const $ = id => document.getElementById(id);

// ---------- Tabs / theme ----------
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    $(`tab-${btn.dataset.tab}`).classList.add("active");
    window.scrollTo({top: 0, behavior: "smooth"});
  });
});
$("themeBtn").addEventListener("click", () => document.body.classList.toggle("light"));

// ---------- Meme generator ----------
const canvas = $("memeCanvas");
const ctx = canvas.getContext("2d");
let currentImage = null;
let lastFoundImageUrl = localStorage.getItem("exodusLastImageUrl") || "";

const controls = ["topText","bottomText","fontSize","strokeSize","textColor","strokeColor","uppercase"];
controls.forEach(id => {
  $(id).addEventListener("input", renderMeme);
  $(id).addEventListener("change", renderMeme);
});
$("sizeSelect").addEventListener("change", resizeCanvas);

function setMemeStatus(t){ $("memeStatus").textContent = t; }

function resizeCanvas(){
  const [w,h] = $("sizeSelect").value.split("x").map(Number);
  canvas.width = w; canvas.height = h; renderMeme();
}

function drawBackground(){
  ctx.fillStyle="#171717"; ctx.fillRect(0,0,canvas.width,canvas.height);
  if(!currentImage){
    ctx.fillStyle="#777"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.font=`${Math.max(24,canvas.width/26)}px Arial`;
    ctx.fillText("Upload, search, or generate an image",canvas.width/2,canvas.height/2);
    return;
  }
  const s=Math.max(canvas.width/currentImage.width,canvas.height/currentImage.height);
  const w=currentImage.width*s,h=currentImage.height*s;
  ctx.drawImage(currentImage,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
}
function wrap(text,maxWidth){
  const words=text.trim().split(/\s+/),lines=[]; let line="";
  for(const word of words){
    const test=line?`${line} ${word}`:word;
    if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=word}else line=test;
  }
  if(line)lines.push(line); return lines.slice(0,6);
}
function drawText(text,y,top=true){
  if(!text.trim())return;
  const size=Number($("fontSize").value);
  ctx.font=`900 ${size}px Impact, Arial Black, sans-serif`;
  ctx.textAlign="center";ctx.textBaseline="top";ctx.lineJoin="round";
  ctx.fillStyle=$("textColor").value;ctx.strokeStyle=$("strokeColor").value;ctx.lineWidth=Number($("strokeSize").value);
  const final=$("uppercase").checked?text.toUpperCase():text;
  const lines=wrap(final,canvas.width*.9),lh=size*1.08;
  let sy=top?y:y-lines.length*lh;
  lines.forEach((line,i)=>{const yy=sy+i*lh;if(ctx.lineWidth)ctx.strokeText(line,canvas.width/2,yy);ctx.fillText(line,canvas.width/2,yy)});
}
function renderMeme(){
  ctx.clearRect(0,0,canvas.width,canvas.height);drawBackground();
  const pad=Math.max(20,canvas.height*.03);
  drawText($("topText").value,pad,true);
  drawText($("bottomText").value,canvas.height-pad,false);
}
function loadImageUrl(url, statusText="Image loaded"){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.crossOrigin="anonymous";
    img.onload=()=>{currentImage=img;lastFoundImageUrl=url;localStorage.setItem("exodusLastImageUrl",url);renderMeme();setMemeStatus(statusText);resolve(img)};
    img.onerror=()=>reject(new Error("Image could not be loaded into the meme canvas."));
    img.src=url;
  });
}
$("imageInput").addEventListener("change",e=>{
  const file=e.target.files?.[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{const img=new Image();img.onload=()=>{currentImage=img;renderMeme();setMemeStatus("Upload loaded")};img.src=ev.target.result};
  reader.readAsDataURL(file);
});
$("blankBtn").addEventListener("click",()=>{currentImage=null;renderMeme();setMemeStatus("Blank canvas")});
$("clearBtn").addEventListener("click",()=>{currentImage=null;$("topText").value="";$("bottomText").value="";renderMeme();setMemeStatus("Cleared")});
$("useLastImageBtn").addEventListener("click",async()=>{
  if(!lastFoundImageUrl){setMemeStatus("No searched/generated image yet");return}
  try{await loadImageUrl(lastFoundImageUrl,"Last image loaded")}catch(e){setMemeStatus(e.message)}
});
$("downloadBtn").addEventListener("click",()=>{
  try{
    renderMeme();
    const a=document.createElement("a");a.download=`exodus-meme-${Date.now()}.png`;a.href=canvas.toDataURL("image/png");a.click();setMemeStatus("Downloaded");
  }catch(e){setMemeStatus("Download blocked by image source; try another result or upload")}
});
$("saveBtn").addEventListener("click",()=>{
  const d={top:$("topText").value,bottom:$("bottomText").value,size:$("sizeSelect").value,fontSize:$("fontSize").value,stroke:$("strokeSize").value,text:$("textColor").value,outline:$("strokeColor").value,uppercase:$("uppercase").checked};
  localStorage.setItem("exodusMemeDraft",JSON.stringify(d));setMemeStatus("Draft saved");
});
$("loadBtn").addEventListener("click",()=>{
  const raw=localStorage.getItem("exodusMemeDraft");if(!raw){setMemeStatus("No draft");return}
  const d=JSON.parse(raw);$("topText").value=d.top||"";$("bottomText").value=d.bottom||"";$("sizeSelect").value=d.size||"800x800";$("fontSize").value=d.fontSize||58;$("strokeSize").value=d.stroke||5;$("textColor").value=d.text||"#ffffff";$("strokeColor").value=d.outline||"#000000";$("uppercase").checked=d.uppercase!==false;resizeCanvas();setMemeStatus("Draft loaded");
});

const captions={
  cats:[
    ["I HEARD THE TREAT BAG","FROM THREE ROOMS AWAY"],
    ["ME: I DON'T NEED ANOTHER CAT","ALSO ME: LOOK AT THIS BABY"],
    ["WHEN THE BOX IS BETTER","THAN THE THING YOU BOUGHT"]
  ],
  gaming:[
    ["JUST ONE MORE MATCH","3 HOURS LATER"],
    ["WHEN THE BOSS HAS 1 HP","AND SO DO YOU"],
    ["ME CHECKING MY INVENTORY","FOR THE 47TH TIME"]
  ],
  work:[
    ["THIS MEETING COULD HAVE BEEN","AN EMAIL"],
    ["WHEN IT'S 4:59 PM","AND SOMEONE SAYS QUICK QUESTION"],
    ["I FINISHED THE TASK","SO HERE ARE THREE MORE"]
  ],
  school:[
    ["I'LL START EARLY THIS TIME","11:58 PM"],
    ["WHEN THE TEACHER SAYS","THIS WILL BE ON THE TEST"],
    ["GROUP PROJECT","SOLO PROJECT WITH WITNESSES"]
  ],
  dnd:[
    ["THE DM: ARE YOU SURE?","THE PARTY: ABSOLUTELY"],
    ["I HAVE A PLAN","ROLLS NATURAL 1"],
    ["WHEN THE LOOT IS CURSED","BUT IT HAS +2"]
  ],
  reaction:[
    ["ME PRETENDING","I UNDERSTAND WHAT JUST HAPPENED"],
    ["THAT MOMENT WHEN","THE PLAN ACTUALLY WORKS"],
    ["I WAS NOT READY","BUT HERE WE ARE"]
  ]
};
$("funnyBtn").addEventListener("click",()=>{
  let cat=$("captionCategory").value;
  const keys=Object.keys(captions);if(cat==="random")cat=keys[Math.floor(Math.random()*keys.length)];
  const arr=captions[cat];const pair=arr[Math.floor(Math.random()*arr.length)];
  $("topText").value=pair[0];$("bottomText").value=pair[1];renderMeme();setMemeStatus(`Funny text: ${cat}`);
});

// ---------- Wikimedia Commons image search ----------
async function searchImages(q){
  $("searchStatus").textContent="Searching…";$("imageResults").innerHTML="";
  const api="https://commons.wikimedia.org/w/api.php";
  const params=new URLSearchParams({
    action:"query",generator:"search",gsrsearch:q,gsrnamespace:"6",gsrlimit:"30",
    prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"500",format:"json",origin:"*"
  });
  try{
    const res=await fetch(`${api}?${params}`);if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();const pages=Object.values(data.query?.pages||{});
    const items=pages.map(p=>{
      const i=p.imageinfo?.[0];return i?{title:p.title.replace(/^File:/,""),thumb:i.thumburl||i.url,url:i.thumburl||i.url,full:i.url}:null
    }).filter(Boolean);
    renderSearchResults(items);$("searchStatus").textContent=`${items.length} results`;
  }catch(e){$("searchStatus").textContent="Search failed";$("imageResults").innerHTML=`<div class="callout error">${escapeHtml(e.message)}</div>`}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function renderSearchResults(items){
  if(!items.length){$("imageResults").innerHTML='<div class="callout">No image results.</div>';return}
  $("imageResults").innerHTML=items.map((x,i)=>`
    <article class="image-card">
      <img src="${escapeHtml(x.thumb)}" alt="${escapeHtml(x.title)}" loading="lazy">
      <div class="body">
        <h3 title="${escapeHtml(x.title)}">${escapeHtml(x.title)}</h3>
        <button class="btn primary use-search-image" data-i="${i}">Use in Meme</button>
      </div>
    </article>`).join("");
  document.querySelectorAll(".use-search-image").forEach(btn=>btn.addEventListener("click",async()=>{
    const x=items[Number(btn.dataset.i)];
    try{
      await loadImageUrl(x.url,"Search image loaded");
      document.querySelector('[data-tab="meme"]').click();
    }catch(e){$("searchStatus").textContent=e.message}
  }));
}
$("searchBtn").addEventListener("click",()=>{const q=$("imageSearch").value.trim();if(q)searchImages(q)});
$("imageSearch").addEventListener("keydown",e=>{if(e.key==="Enter")$("searchBtn").click()});
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{$("imageSearch").value=b.dataset.query;searchImages(b.dataset.query)}));

// ---------- Optional AI image generation ----------
$("aiKey").value=localStorage.getItem("exodusPollinationsKey")||"";
$("saveAiKeyBtn").addEventListener("click",()=>{localStorage.setItem("exodusPollinationsKey",$("aiKey").value.trim());$("aiStatus").textContent="Key saved in this browser only."});
$("generateAiBtn").addEventListener("click",async()=>{
  const key=$("aiKey").value.trim(),prompt=$("aiPrompt").value.trim();
  if(!key||!prompt){$("aiStatus").textContent="Enter an API key and image prompt.";return}
  const [w,h]=$("aiShape").value.split("x");
  $("aiStatus").textContent="Generating image…";
  $("aiResult").innerHTML="";
  try{
    const url=`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${encodeURIComponent($("aiModel").value)}&width=${w}&height=${h}`;
    const res=await fetch(url,{headers:{Authorization:`Bearer ${key}`}});
    if(!res.ok)throw new Error(`AI service returned ${res.status}`);
    const blob=await res.blob();const obj=URL.createObjectURL(blob);
    $("aiResult").innerHTML=`<img id="generatedPreview" src="${obj}" alt="Generated image"><button id="useAiBtn" class="btn primary" style="margin-top:12px">Use Generated Image in Meme</button>`;
    lastFoundImageUrl=obj;
    $("useAiBtn").addEventListener("click",async()=>{
      try{await loadImageUrl(obj,"AI image loaded");document.querySelector('[data-tab="meme"]').click()}catch(e){$("aiStatus").textContent=e.message}
    });
    $("aiStatus").textContent="Image generated.";
  }catch(e){$("aiStatus").textContent=`Generation failed: ${e.message}`}
});

// ---------- Google Drive / Picker ----------
const GOOGLE_CFG = window.EXODUS_GOOGLE_CONFIG || {};
let accessToken=null, tokenClient=null, pickerLoaded=false;

function driveStatus(t){$("driveStatus").textContent=t}
function driveError(t){
  if(!t){$("driveError").classList.add("hidden");$("driveError").textContent="";return}
  $("driveError").classList.remove("hidden");
  $("driveError").classList.add("error");
  $("driveError").textContent=t;
}

function googleConfigReady(){
  const missing = [];
  if(!GOOGLE_CFG.clientId || GOOGLE_CFG.clientId.includes("YOUR_")) missing.push("clientId");
  if(!GOOGLE_CFG.apiKey || GOOGLE_CFG.apiKey.includes("YOUR_")) missing.push("apiKey");
  if(!GOOGLE_CFG.appId || GOOGLE_CFG.appId.includes("YOUR_")) missing.push("appId");
  if(missing.length){
    driveError(`Google config is incomplete. Edit google-config.js and set: ${missing.join(", ")}.`);
    return false;
  }
  return true;
}

function waitGoogle(timeout=12000){
  return new Promise((resolve,reject)=>{
    const s=Date.now(),timer=setInterval(()=>{
      if(window.google?.accounts?.oauth2 && window.gapi){
        clearInterval(timer);
        resolve();
      } else if(Date.now()-s>timeout){
        clearInterval(timer);
        reject(new Error("Google scripts did not load. Reload the page and check browser blockers."));
      }
    },150);
  });
}

function loadPicker(){
  return new Promise((resolve,reject)=>{
    if(pickerLoaded)return resolve();
    gapi.load("picker",{
      callback:()=>{pickerLoaded=true;resolve()},
      onerror:()=>reject(new Error("Google Picker library failed to load."))
    });
  });
}

$("connectDriveBtn").addEventListener("click",async()=>{
  driveError("");
  if(!googleConfigReady()) return;

  try{
    driveStatus("Loading Google…");
    await waitGoogle();
    await loadPicker();

    tokenClient=google.accounts.oauth2.initTokenClient({
      client_id:GOOGLE_CFG.clientId,
      scope:"https://www.googleapis.com/auth/drive.readonly",
      callback:r=>{
        if(r.error){
          driveStatus("Sign-in failed");
          driveError(`${r.error}: ${r.error_description||"Google did not grant access."}`);
          return;
        }
        accessToken=r.access_token;
        $("pickVideoBtn").disabled=false;
        driveStatus("Connected");
        driveError("");
      },
      error_callback:e=>{
        driveStatus("Sign-in failed");
        driveError(`Google sign-in popup error: ${e.type||"unknown error"}. If the app is in Testing, add your Google account as a Test user. Also verify https://masterproof.github.io is an Authorized JavaScript origin.`);
      }
    });

    tokenClient.requestAccessToken({prompt:"consent"});
  }catch(e){
    driveStatus("Failed");
    driveError(e.message);
  }
});

$("pickVideoBtn").addEventListener("click",()=>{
  if(!accessToken){
    driveError("Sign in to Google first.");
    return;
  }
  if(!googleConfigReady()) return;

  try{
    const view=new google.picker.DocsView(google.picker.ViewId.DOCS);
    view.setMimeTypes("video/mp4,video/webm,video/quicktime,video/x-matroska,video/mpeg");

    const picker=new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_CFG.apiKey)
      .setAppId(GOOGLE_CFG.appId)
      .setOrigin(window.location.origin)
      .setCallback(data=>{
        if(data.action===google.picker.Action.PICKED){
          const f=data.docs?.[0];
          if(!f?.id)return;
          $("drivePlayer").src=`https://drive.google.com/file/d/${encodeURIComponent(f.id)}/preview`;
          $("driveNowPlaying").textContent=`Now playing: ${f.name||"Google Drive video"}`;
          driveStatus("Playing");
        }
      })
      .build();

    picker.setVisible(true);
  }catch(e){
    driveError(`Picker failed: ${e.message}`);
  }
});

$("closeDrivePlayerBtn").addEventListener("click",()=>{
  $("drivePlayer").src="";
  $("driveNowPlaying").textContent="No Drive video selected.";
  driveStatus(accessToken?"Connected":"Not connected");
});

if(googleConfigReady()){
  driveStatus("Configured");
}

resizeCanvas();
