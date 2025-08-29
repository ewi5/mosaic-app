// Mosaic v12
const SELECT = (q, el=document) => el.querySelector(q);
const SELECTALL = (q, el=document) => Array.from(el.querySelectorAll(q));

// ----- Contacts (sample) -----
const contacts = [
  { name:'viv', days:8 },
  { name:'mom', days:7 },
  { name:'dad', days:7 },
  { name:'sis', days:2 },
  { name:'bro', days:5 },
  { name:'gabe', days:6 },
  { name:'lang', days:0.3, unit:'h' },
  { name:'helen', days:8 },
  { name:'tulio', days:7 },
  { name:'nina', days:8 },
  { name:'ryan', days:8 },
  { name:'kai', days:6 },
];

// ----- Apple‑ish initials color palette (deterministic) -----
const palette = [
  '#6A7FDB','#FF8A65','#FFB74D','#81C784','#4DD0E1','#BA68C8',
  '#9575CD','#F06292','#4FC3F7','#AED581','#FFD54F','#90CAF9',
  '#A1887F','#E57373','#64B5F6'
];
function hashToIndex(str){
  let h=0; for(let i=0;i<str.length;i++){h=(h<<5)-h+str.charCodeAt(i); h|=0;}
  return Math.abs(h)%palette.length;
}
function initials2(name){
  const parts = name.trim().split(/\s+/);
  const f = parts[0]?.[0] || '';
  const l = parts[1]?.[0] || parts[0]?.[1] || '';
  return (f+l).toLowerCase();
}

function render(){
  const grid = SELECT('#windows');
  grid.innerHTML='';
  contacts.forEach((c, idx)=>{
    const dLabel = typeof c.days==='number' && c.days<1 && c.unit==='h' ? `${Math.round(c.days*24)}h` : `${Math.round(c.days)}d`;
    const el = document.createElement('section');
    el.className='window';

    const avatar = document.createElement('div');
    avatar.className='avatar';
    avatar.style.background = palette[hashToIndex(c.name)];
    avatar.textContent = initials2(c.name);

    const head = document.createElement('div');
    head.className='header';
    const nm = document.createElement('div');
    nm.className='name';
    nm.textContent = c.name.toLowerCase();

    const ago = document.createElement('div');
    ago.className='ago';
    ago.textContent = dLabel;

    head.append(avatar, nm, ago);

    const meta = document.createElement('div');
    meta.className='meta';
    meta.textContent = `days since pol: ${Math.max(0, Math.round(c.days))}`;

    const actions = document.createElement('div');
    actions.className='actions';

    const btnKnock = document.createElement('button');
    btnKnock.className='btn-knock';
    btnKnock.textContent='knock';

    const btnPol = document.createElement('button');
    btnPol.className='btn-pol';
    btnPol.title='pol';
    btnPol.textContent='pol';

    btnPol.addEventListener('click',()=>{
      c.days = 0;
      meta.textContent = `days since pol: 0`;
      // glow burst
      btnPol.animate([{transform:'scale(1)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:280, easing:'ease-out'});
    });

    actions.append(btnKnock, btnPol);

    el.append(head, meta, actions);
    grid.appendChild(el);
  });
}

render();

// ----- Clock -----
function fmtTime(d){
  const z=(n)=>String(n).padStart(2,'0');
  let h=d.getHours(), m=z(d.getMinutes()), s=z(d.getSeconds());
  const ampm = h>=12?'PM':'AM';
  h = h%12 || 12;
  return `${h}:${m}:${s} ${ampm}`;
}
function tickClock(){
  SELECT('#clock').textContent = fmtTime(new Date());
  requestAnimationFrame(()=>setTimeout(tickClock, 1000));
}
tickClock();

// ----- Geo + Weather (Open‑Meteo, no key) -----
const GEO_KEY='mosaic_geo_cache_v1';
async function getCoords(){
  const cacheRaw = localStorage.getItem(GEO_KEY);
  if(cacheRaw){
    try {
      const cache = JSON.parse(cacheRaw);
      if(Date.now()-cache.ts < 1000*60*60*12){ return cache.coords; }
    }catch(_){}
  }
  // ask only if needed
  const perm = await (navigator.permissions?.query({name:'geolocation'})||Promise.resolve({state:'prompt'}));
  if(perm.state==='denied') return null;
  return new Promise((res)=>{
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude, longitude} = pos.coords;
      const coords = {lat:+latitude.toFixed(2), lon:+longitude.toFixed(2)};
      localStorage.setItem(GEO_KEY, JSON.stringify({ts:Date.now(), coords}));
      res(coords);
    }, ()=>res(null), {enableHighAccuracy:false, maximumAge: 3600_000});
  });
}

async function getWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
    const r = await fetch(url);
    const j = await r.json();
    const t = Math.round(j.current?.temperature_2m ?? 0);
    const w = Math.round(j.current?.wind_speed_10m ?? 0);
    return {t,w};
  }catch(_){ return {t:'--', w:'--'} }
}

(async()=>{
  const coords = await getCoords();
  if(coords){
    SELECT('#city span')?.replaceWith(document.createElement('span'));
    SELECT('#city').innerHTML = `📍 <span>${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}</span>`;
    const wx = await getWeather(coords.lat, coords.lon);
    SELECT('#wx').innerHTML = `${wx.t}° • <span id="wind">wind ${wx.w}</span>`;
  } else {
    SELECT('#city').innerHTML = '📍 <span>location off</span>';
    SELECT('#wx').innerHTML = `—° • <span id="wind">wind —</span>`;
  }
})();
