// People data
const people = [
  {first:'viv', last:'vance'},
  {first:'mom', last:'m'},
  {first:'dad', last:'d'},
  {first:'sis', last:'s'},
  {first:'bro', last:'b'},
  {first:'gabe', last:'g'},
  {first:'lang', last:'l'},
  {first:'helen', last:'h'},
  {first:'tulio', last:'t'},
  {first:'nina', last:'n'},
  {first:'ryan', last:'r'},
  {first:'kai', last:'k'}
];

// Hash to color (consistent per person)
function hashColor(str){
  let h = 0; for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) | 0;
  const hue = Math.abs(h)%360; return `hsl(${hue} 60% 45%)`;
}
function initials(first,last){ 
  const f = (first?.[0]||'').toLowerCase();
  const l = (last?.[0]||'').toLowerCase();
  return `${f}${l}`; 
}

// Build cards
const tpl = document.getElementById('card-tpl');
const deck = document.getElementById('cards');
people.forEach(p => {
  const node = tpl.content.firstElementChild.cloneNode(true);
  const av = node.querySelector('.avatar');
  av.textContent = initials(p.first,p.last);
  av.style.background = hashColor(p.first+p.last);
  node.querySelector('.handle').textContent = p.first.toLowerCase();
  node.querySelector('.knock').addEventListener('click', () => alert(`knocked ${p.first}`));
  node.querySelector('.pol').addEventListener('click', () => alert(`POL sent to ${p.first}`));
  deck.appendChild(node);
});

// Weather + location (left bar). Only ask once unless we still have nothing.
const wxEl = document.getElementById('wx');
const askedKey = 'mosaic_geo_asked';
const posKey = 'mosaic_geo_pos';

function formatWx(tempC, windK){
  const t = Math.round(tempC);
  const w = Math.round(windK);
  return `${t}° • wind ${w}`;
}

async function refreshWeather(lat, lon){
  try{
    // No external calls; fake weather derived from lat/lon so it is deterministic offline
    const seed = Math.abs(Math.sin(lat*12.34 + lon*56.78));
    const tempC = 12 + Math.round(seed*18);
    const wind = 1 + Math.round(seed*7);
    wxEl.textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)} • ${formatWx(tempC, wind)}`;
  }catch(e){
    wxEl.textContent = 'location unavailable';
  }
}

function getPositionOnce(){
  const cached = localStorage.getItem(posKey);
  if (cached){
    try{
      const p = JSON.parse(cached);
      refreshWeather(p.lat, p.lon);
      return;
    }catch(e){}
  }
  // Only ask once
  if (!localStorage.getItem(askedKey)){
    localStorage.setItem(askedKey,'1');
    navigator.geolocation?.getCurrentPosition(
      (pos)=>{
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        localStorage.setItem(posKey, JSON.stringify({lat,lon, t:Date.now()}));
        refreshWeather(lat,lon);
      },
      (_err)=>{
        wxEl.textContent='location blocked';
      },
      {enableHighAccuracy:false, timeout:5000}
    );
  }else{
    wxEl.textContent='location off';
  }
}
getPositionOnce();

// Clock
function tick(){
  const d = new Date();
  const s = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  document.getElementById('clock').textContent = s;
  requestAnimationFrame(()=>{});
}
setInterval(tick, 1000); tick();
