// demo contacts (first + last; initials auto -> lowercase two letters)
const contacts = [
  { name: "viv", days: 8, color: "#EAB308" },
  { name: "mom", days: 7, color: "#34D399" },
  { name: "dad", days: 7, color: "#A78BFA" },
  { name: "sis", days: 2, color: "#F59E0B" },
  { name: "bro", days: 5, color: "#9CA3AF" },
  { name: "gabe", days: 6, color: "#22C55E" },
  { name: "nina", days: 8, color: "#60A5FA" },
  { name: "ryan", days: 8, color: "#F87171" },
  { name: "kai", days: 6, color: "#F472B6" }
];

// Apple-ish auto color map if color is missing
function colorFor(name){
  if (!name) return "#64748B";
  const palette = ["#F59E0B","#10B981","#3B82F6","#A78BFA","#F472B6","#22C55E","#EAB308","#F97316","#60A5FA","#D946EF"];
  let sum = 0; for (let c of name) sum += c.charCodeAt(0);
  return palette[sum % palette.length];
}

// Render grid (always 3 columns via CSS)
const grid = document.querySelector("#grid");
contacts.forEach(c => {
  const el = document.createElement("article");
  el.className = "card";
  const initials = (c.name.slice(0,2)).toLowerCase();
  const bg = c.color || colorFor(c.name);
  el.innerHTML = `
    <div class="row">
      <div class="avatar" style="background:${bg}">${initials}</div>
      <div class="meta">
        <div class="name">${c.name}</div>
      </div>
      <div style="margin-left:auto; color:#8b95a6; font-weight:700">${c.days}d</div>
    </div>
    <div class="days">days since pol: ${c.days}</div>
    <div class="controls">
      <button class="pill">knock</button>
      <button class="pol">pol</button>
    </div>
  `;
  grid.appendChild(el);
});

/* Sky bar: city • temp • time (no wind; left column stays fixed) */
(async function sky(){
  const timeEl = document.querySelector("#time");
  const cityEl = document.querySelector("#city");
  const tempEl = document.querySelector("#temp");

  function tick(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    timeEl.textContent = `${hh}:${mm}`;
  }
  setInterval(tick, 1000*15); tick();

  // get location once and cache so it doesn't re-ask constantly
  try{
    const cache = localStorage.getItem("geoCache");
    let posObj = cache ? JSON.parse(cache) : null;
    if(!posObj){
      const pos = await new Promise((res, rej)=>navigator.geolocation.getCurrentPosition(res, rej, {maximumAge: 3600000, timeout: 8000}));
      posObj = {lat: pos.coords.latitude, lon: pos.coords.longitude, t: Date.now()};
      localStorage.setItem("geoCache", JSON.stringify(posObj));
    }
    // reverse geocode via static list fallback (no external calls here)
    cityEl.textContent = approximateCity(posObj.lat, posObj.lon);
    // fake temperature for demo (replace with API when keys are ready)
    tempEl.textContent = Math.round(18 + Math.sin(Date.now()/3600000)*4);
  }catch(e){
    cityEl.textContent = "your city";
    tempEl.textContent = "18";
  }
})();

// Very coarse reverse geocode without external API (demo-only)
function approximateCity(lat, lon){
  if(lat==null || lon==null) return "your city";
  // quick bounds check for LA-ish as your screenshots suggest
  if(lat>33 && lat<35 && lon>-119.5 && lon<-117) return "los angeles";
  return "your city";
}
