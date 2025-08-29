// Mosaic V17 — city • temp • wind • time
const contacts = [
  { name: "viv", days: 8, home: true },
  { name: "mom", days: 7, home: false },
  { name: "dad", days: 7, home: true },
  { name: "sis", days: 2, home: true },
  { name: "bro", days: 5, home: false },
  { name: "gabe", days: 6, home: true },
  { name: "nina", days: 8, home: false },
  { name: "ryan", days: 8, home: true },
  { name: "kai", days: 6, home: false },
];

// iOS‑ish deterministic color palette
const IOS_COLORS = [
  "#FF9500","#FF3B30","#FF2D55","#FF9F0A","#AF52DE","#5856D6",
  "#5AC8FA","#34C759","#007AFF","#64D2FF","#30B0C7","#A2845E"
];
function hash(s){let h=0; for(let i=0;i<s.length;i++) h=(h<<5)-h+s.charCodeAt(i); return Math.abs(h);}
function colorFor(name){ return IOS_COLORS[ hash(name.toLowerCase()) % IOS_COLORS.length ]; }
function initials(name){
  const parts = name.trim().split(/\s+/);
  if(parts.length===1) return parts[0].slice(0,2).toLowerCase();
  return (parts[0][0]+parts[parts.length-1][0]).toLowerCase();
}

// Build UI
const grid = document.getElementById('grid');
contacts.forEach(c=>{
  const card = document.createElement('div');
  card.className = 'card ' + (c.home ? 'home':'away');

  const av = document.createElement('div');
  av.className='avatar';
  const hex = colorFor(c.name);
  av.style.background = hex;
  av.style.setProperty('--avatarGlow', hex+'55');
  av.textContent = initials(c.name);

  const name = document.createElement('div');
  name.className='name';
  name.textContent = c.name.toLowerCase();

  const row = document.createElement('div');
  row.className='row';
  row.append(av, name);

  const days = document.createElement('div');
  days.className='days';
  days.textContent = `days since pol: ${c.days}`;

  const pills = document.createElement('div');
  pills.className='pills';
  const knock = document.createElement('button');
  knock.className='pill';
  knock.textContent='knock';
  const pol = document.createElement('button');
  pol.className='pol';
  pol.textContent='pol';
  pills.append(knock, pol);

  card.append(row, days, pills);
  grid.append(card);
});

// Sky meta bar — city • temp • wind • time ; persist geolocation for 12h
const storageKey = 'mosaic_geo_cache_v1';
async function getCoords(){
  const cached = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if(cached && (Date.now()-cached.ts) < 12*60*60*1000) return cached.coords;
  return new Promise((resolve,reject)=>{
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        localStorage.setItem(storageKey, JSON.stringify({ ts: Date.now(), coords }));
        resolve(coords);
      },
      err => reject(err),
      { enableHighAccuracy: false, maximumAge: 3600_000, timeout: 8000 }
    );
  });
}

const metabar = document.getElementById('metabar');
function fmtTime(d){
  let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const ampm = h>=12?'PM':'AM'; h = h%12 || 12;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}
async function loadSky(){
  try{
    const {lat, lon} = await getCoords();
    // Reverse geocode to city (open‑meteo API — CORS friendly)
    const g = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en`).then(r=>r.json());
    const city = (g && g.results && g.results[0] && (g.results[0].city || g.results[0].name)) || 'your city';
    // Weather
    const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&timezone=auto`).then(r=>r.json());
    const t = Math.round(w?.current?.temperature_2m ?? 0);
    const wind = Math.round(w?.current?.wind_speed_10m ?? 0);
    metabar.textContent = `📍 ${city.toLowerCase()} • ${t}° • wind ${wind} • ${fmtTime(new Date())}`;
  }catch(e){
    const now = fmtTime(new Date());
    metabar.textContent = `📍 auto • —° • wind — • ${now}`;
  }
}
loadSky();
setInterval(()=>{
  // keep time ticking visually
  const txt = metabar.textContent;
  const parts = txt.split('•');
  if(parts.length>=4){
    parts[3] = ' ' + fmtTime(new Date());
    metabar.textContent = parts.join('•');
  }
}, 60*1000);
