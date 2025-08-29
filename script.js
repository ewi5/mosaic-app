// --- Demo contacts (fake data) ---
const contacts = [
  { name: "viv",   days: 8 },
  { name: "mom",   days: 7 },
  { name: "dad",   days: 7 },
  { name: "sis",   days: 2 },
  { name: "bro",   days: 5 },
  { name: "gabe",  days: 6 },
  { name: "lang",  days: 3 },
  { name: "nina",  days: 8 },
  { name: "ryan",  days: 8 },
  { name: "kai",   days: 6 },
  { name: "helen", days: 4 },
  { name: "tulio", days: 7 }
];

// consistent "Apple-like" avatar color: hash name -> 0..10 bucket
const hueBucket = s => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 11; // 11 hues defined in CSS
};

function initials(name){
  const parts = name.trim().toLowerCase().split(/\s+/);
  if (parts.length === 1) {
    // first + last initial not available, double first letter
    return (parts[0][0] || "").repeat(2);
  }
  return (parts[0][0] + parts[1][0]);
}

// Build the grid — ALWAYS 3 columns (CSS enforces fixed card width)
const grid = document.getElementById("grid");
grid.innerHTML = contacts.map(c => {
  const ini = initials(c.name);
  const hue = hueBucket(c.name);
  return `
    <article class="card">
      <div class="row">
        <div class="avatar" data-hue="${hue}">${ini}</div>
        <div class="name">${c.name}</div>
        <div style="margin-left:auto;color:#9aa7b2;font-weight:700">${c.days}d</div>
      </div>
      <div class="days">days since pol: ${c.days}</div>
      <div class="actions">
        <button class="pill">knock</button>
        <button class="pol" title="proof of life"></button>
      </div>
    </article>
  `;
}).join("");

// ---- Left sky: city • temp° • time (no wind, no coords) ----

// Persisted location so we don't nag each visit
const LS_KEY = "mosaic:geo";
const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");

async function getPosition(){
  if (saved && saved.coords) return saved.coords;
  return new Promise((resolve, reject)=>{
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        localStorage.setItem(LS_KEY, JSON.stringify({coords}));
        resolve(coords);
      },
      (err)=>{
        // fallback to LA if denied
        resolve({ lat: 34.05, lon: -118.24 });
      },
      { enableHighAccuracy:true, timeout: 6000 }
    );
  });
}

function formatTime(d){
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}

async function loadSky(){
  const {lat, lon} = await getPosition();

  // Reverse geocode -> city
  const cityPromise = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`)
    .then(r=>r.json()).then(j=>{
      return j.address.city || j.address.town || j.address.village || j.address.county || "your city";
    }).catch(()=> "your city");

  // Weather temp (°C) from Open-Meteo
  const weatherPromise = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`)
    .then(r=>r.json()).then(j=>Math.round(j.current.temperature_2m))
    .catch(()=>"—");

  const [city, temp] = await Promise.all([cityPromise, weatherPromise]);
  document.getElementById("city").textContent = `📍 ${city}`;
  document.getElementById("temp").textContent = `${temp}°`;
  const tick = ()=>{
    document.getElementById("time").textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  };
  tick(); setInterval(tick, 1000*30);
}
loadSky();

// --- Prevent the left sky from ever scrolling ---
// Body is overflow:hidden; only .building-wrap scrolls vertically — already enforced.
