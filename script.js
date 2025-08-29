// v14 — design-only iteration (functions unchanged in spirit)
const grid = document.getElementById('grid');

// Sample people; days kept as before. We'll mark some away for visual testing only (design aid).
const people = [
  { name:'viv',  days:8,  away:false },
  { name:'mom',  days:7,  away:true  },
  { name:'dad',  days:7,  away:false },
  { name:'sis',  days:2,  away:false },
  { name:'bro',  days:5,  away:true  },
  { name:'gabe', days:6,  away:false },
  { name:'lang', days:3,  away:false },
  { name:'helen',days:8,  away:true  },
  { name:'kai',  days:6,  away:false },
];

// Apple-ish deterministic color by name
const palette = ['#34C759','#30B0C7','#0A84FF','#5E5CE6','#FF375F','#FF9F0A','#64D2FF','#FF453A','#BF5AF2','#32D74B','#FFD60A','#8E8E93'];
function colorFor(name){ let h=0; for(let i=0;i<name.length;i++){h=(h*31+name.charCodeAt(i))>>>0} return palette[h%palette.length]; }
function initials(name){ const p=name.trim().split(/\s+/); const a=p[0]?.[0]||''; const b=p[1]?.[0]||p[0]?.[1]||''; return (a+b).toLowerCase(); }

function card(p){
  const pane = document.createElement('article');
  pane.className = 'window ' + (p.away ? 'away' : 'home');

  const head = document.createElement('div');
  head.className = 'header';

  const init = document.createElement('div');
  init.className = 'initials';
  init.textContent = initials(p.name);
  const tint = colorFor(p.name);
  init.style.background = `radial-gradient(circle at 35% 35%, ${tint}, ${tint}88)`;
  init.style.color = tint;

  const name = document.createElement('div');
  name.className = 'name'; name.textContent = p.name.toLowerCase();

  const ago = document.createElement('div');
  ago.className = 'ago'; ago.textContent = `${p.days}d`;

  head.append(init, name, ago);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `days since pol: ${p.days}`;

  const actions = document.createElement('div');
  actions.className = 'actions';
  const knock = Object.assign(document.createElement('button'), {className:'knock', textContent:'knock'});
  const pol   = Object.assign(document.createElement('button'), {className:'pol', textContent:'pol'});
  actions.append(knock, pol);

  pane.append(head, meta, actions);

  // Away state shade (design only)
  if(p.away){
    const shade = document.createElement('div');
    shade.className = 'shade';
    const pfp = document.createElement('div');
    pfp.className = 'pfp';
    // Placeholder image gradient using same tint
    pfp.style.backgroundImage = `radial-gradient(circle at 30% 30%, ${tint}, ${tint}44, #0b0f14 70%)`;
    shade.appendChild(pfp);
    pane.appendChild(shade);
  }

  return pane;
}

people.forEach(p => grid.appendChild(card(p)));

// Left meta: city • weather • time (minimal, same behavior)
const cityEl = document.getElementById('city');
const wxEl   = document.getElementById('wx');
const timeEl = document.getElementById('time');

function tick(){ const n = new Date(); timeEl.textContent = n.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
setInterval(tick,1000); tick();

async function coords(){
  try{
    const cached = JSON.parse(localStorage.getItem('mosaic:coords')||'null');
    if(cached && (Date.now()-cached.t) < 12*60*60*1000) return cached;
  }catch{}
  return new Promise(res=>{
    if(!navigator.geolocation){ res({lat:34.05, lon:-118.24, t:Date.now(), f:true}); return; }
    navigator.geolocation.getCurrentPosition(p=>{
      const c = {lat:+p.coords.latitude.toFixed(2), lon:+p.coords.longitude.toFixed(2), t:Date.now()};
      try{ localStorage.setItem('mosaic:coords', JSON.stringify(c)); }catch{}
      res(c);
    }, _=>res({lat:34.05, lon:-118.24, t:Date.now(), f:true}), {timeout:7000});
  });
}
async function weather(lat,lon){
  try{
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&timezone=auto`);
    const j = await r.json();
    return `${Math.round(j.current.temperature_2m)}° • wind ${Math.round(j.current.wind_speed_10m)}`;
  }catch{ return '—'; }
}

(async ()=>{
  const c = await coords();
  cityEl.textContent = `${c.lat.toFixed(2)}, ${c.lon.toFixed(2)}`;
  wxEl.textContent = await weather(c.lat, c.lon);
})();
