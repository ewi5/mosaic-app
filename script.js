// ===== Contacts data (lowercase names) =====
const PEOPLE = [
  { name: 'viv'   },
  { name: 'mom'   },
  { name: 'dad'   },
  { name: 'sis'   },
  { name: 'bro'   },
  { name: 'gabe'  },
  { name: 'lang'  },
  { name: 'helen' },
  { name: 'tulio' },
  { name: 'nina'  },
  { name: 'ryan'  },
  { name: 'kai'   }
];

// ===== Apple-like avatar color palette =====
// Close approximation of iOS contacts background swatches
const APPLE_COLORS = [
  '#5E5CE6', // indigo
  '#AC8FFF', // purple
  '#FF6B6B', // red
  '#FF9F0A', // orange
  '#34C759', // green
  '#64D2FF', // light blue
  '#30B0C7', // teal
  '#FFD60A', // yellow
  '#FFB3C1', // pink
  '#9ED0FF'  // baby blue
];

function appleColorFor(name){
  // stable hash to pick color deterministically
  let h = 0;
  for (let i=0; i<name.length; i++) h = (h*31 + name.charCodeAt(i)) >>> 0;
  return APPLE_COLORS[h % APPLE_COLORS.length];
}

function initials2(name){
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts[1]?.[0] || parts[0]?.[1] || ''; // if only one word, second letter
  return (first + last).toLowerCase();
}

// ===== Build grid =====
const grid = document.getElementById('grid');
const tpl = document.getElementById('card-tpl');

for(const p of PEOPLE){
  const $ = tpl.content.firstElementChild.cloneNode(true);
  const avatar = $.querySelector('.avatar');
  const nameEl = $.querySelector('.name');
  // avatar
  avatar.textContent = initials2(p.name);
  avatar.style.background = appleColorFor(p.name);
  // name
  nameEl.textContent = p.name.toLowerCase();
  // attach events
  $.querySelector('.knock').addEventListener('click', ()=>{
    $.classList.add('shake');
    setTimeout(()=>$.classList.remove('shake'), 500);
  });
  $.querySelector('.pol').addEventListener('click', ()=>{
    $.classList.add('pulse');
    setTimeout(()=>$.classList.remove('pulse'), 900);
  });
  grid.appendChild($);
}

// fun micro-animations via CSS classes
const style = document.createElement('style');
style.textContent = `
.window.shake{animation:shake .45s ease}
@keyframes shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}
.window.pulse .pol{animation:pulse 0.9s ease-in-out}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(164,107,255,.55)}70%{box-shadow:0 0 0 20px rgba(164,107,255,0)}100%{box-shadow:0 0 0 0 rgba(164,107,255,0)}}
`;
document.head.appendChild(style);

// ===== Time (clock) =====
const clockEl = document.getElementById('clock');
function tick(){
  const now = new Date();
  const opts = {hour:'numeric', minute:'2-digit', second:'2-digit'};
  clockEl.textContent = now.toLocaleTimeString([], opts);
}
tick(); setInterval(tick, 1000);

// ===== Geolocation (persist to avoid re-ask) =====
const coordsEl = document.getElementById('coords');
const LOC_KEY = 'mosaic_loc_v1';
const LOC_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h

async function getCoords(){
  const cached = localStorage.getItem(LOC_KEY);
  if (cached){
    try{
      const {lat, lon, ts} = JSON.parse(cached);
      if (Date.now() - ts < LOC_MAX_AGE_MS){
        coordsEl.textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        return {lat, lon, cached:true};
      }
    }catch(e){/* ignore */}
  }
  // ask once
  return new Promise((resolve)=>{
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      localStorage.setItem(LOC_KEY, JSON.stringify({lat, lon, ts: Date.now()}));
      coordsEl.textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      resolve({lat, lon, cached:false});
    }, err => {
      coordsEl.textContent = 'location off';
      resolve(null);
    }, {enableHighAccuracy:false, maximumAge:LOC_MAX_AGE_MS});
  });
}

// ===== Weather (Open-Meteo, no key) =====
const weatherEl = document.getElementById('weather');
async function fetchWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit`;
    const r = await fetch(url);
    const j = await r.json();
    const t = Math.round(j.current.temperature_2m);
    const w = Math.round(j.current.wind_speed_10m);
    weatherEl.textContent = `${t}° • wind ${w}`;
  }catch(e){
    weatherEl.textContent = 'weather unavailable';
  }
}

// init
getCoords().then(c => { if (c) fetchWeather(c.lat, c.lon); });
