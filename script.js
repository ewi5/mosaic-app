// ---------- helpers ----------
const $ = sel => document.querySelector(sel);

function hashString(str){
  let h = 0; for(let i=0;i<str.length;i++){ h = (h<<5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

// Apple-ish deterministic color palette for initials
const APPLEISH = [
  '#f06292', '#9575cd', '#64b5f6', '#4dd0e1', '#81c784', '#ffd54f', '#ff8a65',
  '#ba68c8', '#7986cb', '#4fc3f7', '#4db6ac', '#aed581', '#ffb74d', '#e57373'
];
function initialsColor(name){
  const i = hashString(name.toLowerCase()) % APPLEISH.length;
  return APPLEISH[i];
}

// make initials: first + last initial, lowercase
function initials(name){
  const parts = name.trim().toLowerCase().split(/\s+/);
  if(parts.length===1) return parts[0].slice(0,1);
  return (parts[0][0] + parts[parts.length-1][0]);
}

// ---------- sample data ----------
const people = [
  { name:'viv', days:8 },
  { name:'mom', days:7 },
  { name:'dad', days:7 },
  { name:'sis', days:2 },
  { name:'bro', days:5 },
  { name:'gabe', days:6 },
  { name:'lang', days:1 },
  { name:'helen', days:3 },
  { name:'tulio', days:7 },
  { name:'nina', days:8 },
  { name:'ryan', days:8 },
  { name:'kai', days:6 },
];

// ---------- build grid ----------
function makeCard(p){
  const card = document.createElement('article');
  card.className = 'card';

  const top = document.createElement('div');
  top.className = 'row';

  const av = document.createElement('div');
  av.className = 'avatar';
  av.textContent = initials(p.name);
  av.style.background = initialsColor(p.name);

  const nm = document.createElement('div');
  nm.className = 'name';
  nm.textContent = p.name.toLowerCase();

  top.appendChild(av); top.appendChild(nm);

  const days = document.createElement('div');
  days.className = 'days';
  days.textContent = `days since pol: ${p.days}`;

  const actions = document.createElement('div');
  actions.className = 'actions';
  const knock = Object.assign(document.createElement('button'), { className:'pill', type:'button', textContent:'knock' });
  const pol   = Object.assign(document.createElement('button'), { className:'circle', type:'button', textContent:'pol' });
  actions.append(knock, pol);

  card.append(top, days, actions);
  return card;
}

function buildGrid(){
  const grid = $('#grid');
  grid.innerHTML = '';
  people.forEach(p => grid.appendChild(makeCard(p)));
}
buildGrid();

// ---------- clock ----------
function tickClock(){
  const d = new Date();
  const hrs = d.getHours();
  const hours12 = ((hrs + 11) % 12) + 1;
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  const ampm = hrs >= 12 ? 'PM':'AM';
  $('#timeLine').textContent = `${hours12}:${mins}:${secs} ${ampm}`;
}
setInterval(tickClock, 1000); tickClock();

// ---------- geolocation (cached 12h) + weather ----------
const GEO_KEY = 'mosaic_geo_cache_v1';
const GEO_TTL = 1000 * 60 * 60 * 12; // 12 hours

async function getGeo(){
  // try cache
  try{
    const raw = localStorage.getItem(GEO_KEY);
    if(raw){
      const obj = JSON.parse(raw);
      if(Date.now() - obj.when < GEO_TTL) return obj.coords;
    }
  }catch(e){}

  // request if not cached / expired
  const coords = await new Promise((resolve, reject)=>{
    if(!navigator.geolocation) return reject(new Error('no geo'));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy:false, timeout:7000, maximumAge: 5*60*1000 }
    );
  }).catch(()=> null);

  if(coords){
    localStorage.setItem(GEO_KEY, JSON.stringify({ when: Date.now(), coords }));
  }
  return coords;
}

async function fetchWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
    const res = await fetch(url, { cache:'no-store' });
    const data = await res.json();
    const t = Math.round(data?.current?.temperature_2m ?? 0);
    const w = Math.round(data?.current?.wind_speed_10m ?? 0);
    return { t, w };
  }catch(e){ return null; }
}

(async function initLeftPane(){
  let coords = await getGeo();
  if(!coords){
    // fallback: show "auto" and no prompt again
    $('#geoLine').textContent = '📍 auto';
    $('#weatherLine').textContent = 'weather unavailable';
    return;
  }
  const lat = coords.lat.toFixed(2);
  const lon = coords.lon.toFixed(2);
  $('#geoLine').textContent = `📍 ${lat}, ${lon}`;

  const w = await fetchWeather(coords.lat, coords.lon);
  if(w) $('#weatherLine').textContent = `${w.t}° • wind ${w.w}`;
  else $('#weatherLine').textContent = 'weather unavailable';
})();

// ---------- analog stick ----------
(function stickInit(){
  const base = document.getElementById('stickBase');
  const stick = document.getElementById('stick');
  const center = () => {
    stick.style.left = '50%'; stick.style.top = '50%'; stick.style.transform = 'translate(-50%,-50%)';
  };
  center();

  let active = false;
  function set(e){
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
    const max = rect.width/2 - 10;
    const len = Math.hypot(x,y);
    const clamped = len > max ? max/len : 1;
    const nx = x * clamped;
    const ny = y * clamped;
    stick.style.transform = `translate(${nx}px, ${ny}px)`;
    // You could dispatch a custom event with the vector if needed
    // base.dispatchEvent(new CustomEvent('vector', { detail:{ x:nx/max, y:ny/max } }));
  }
  function end(){ active=false; center(); }

  ['mousedown','touchstart'].forEach(ev => base.addEventListener(ev, (e)=>{ active=true; set(e); }));
  ['mousemove','touchmove'].forEach(ev => window.addEventListener(ev, (e)=>{ if(active) set(e); }, { passive:false }));
  ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => window.addEventListener(ev, end));
})();
