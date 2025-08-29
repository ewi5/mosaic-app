/* V10 — smaller buttons, 3x3 grid, glassy smaller joystick */
const contacts = [
  {name:"viv", days:8},
  {name:"mom", days:7},
  {name:"dad", days:7},
  {name:"sis", days:2},
  {name:"bro", days:5},
  {name:"gabe", days:6},
  {name:"lang", days:3},
  {name:"helen", days:4},
  {name:"kai", days:6},
];

// Apple-ish deterministic color from name
function appleColorFor(name){
  // palette approximating iOS Contact tints
  const palette = [
    "#8e9cff", "#5fb3ff", "#4fd1c5", "#66d17a", "#b7e374",
    "#ffd166", "#ff9f59", "#ff7a7a", "#e16bff", "#b48cff",
    "#6ecbff", "#43e3d8", "#66e6a3", "#d4ef6d", "#ffc36b",
    "#ff9bb1", "#f071e0", "#c5a3ff"
  ];
  let h=0; for (let i=0;i<name.length;i++){ h = (h*31 + name.charCodeAt(i))>>>0; }
  return palette[h % palette.length];
}

function initials(name){
  const parts = name.trim().split(/\s+/);
  const f = parts[0]?.[0] || "";
  const l = (parts[1]?.[0]) || (parts[0]?.[1]||"");
  return (f+l||f).toLowerCase();
}

// Render grid 3x3
function render(){
  const grid = document.getElementById('grid');
  grid.innerHTML = "";
  contacts.slice(0,9).forEach(c=>{
    const el = document.createElement('article');
    el.className = "window";
    el.innerHTML = `
      <div class="row">
        <div class="avatar" style="background:${appleColorFor(c.name)}">${initials(c.name)}</div>
        <div class="name">${c.name}</div>
        <div class="age">${c.days}d</div>
      </div>
      <div class="pol-age">days since pol: ${c.days}</div>
      <div class="actions">
        <button class="pill">knock</button>
        <button class="pol" title="proof of life"></button>
      </div>
    `;
    grid.appendChild(el);
  });
}
render();

/* Clock */
const clock = document.getElementById('clock');
setInterval(()=>{
  clock.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}, 1000);

/* Geolocation cache (12h) */
const GEO_KEY = "mosaic_geo_v10";
async function getGeo(){
  const now = Date.now();
  try{
    const cached = JSON.parse(localStorage.getItem(GEO_KEY)||"null");
    if(cached && (now - cached.t) < 12*60*60*1000){ return cached; }
  }catch{}
  return new Promise((resolve)=>{
    navigator.geolocation.getCurrentPosition(pos=>{
      const data = {lat:pos.coords.latitude, lon:pos.coords.longitude, t:Date.now()};
      localStorage.setItem(GEO_KEY, JSON.stringify(data));
      resolve(data);
    }, _err=>{
      // fallback: downtown LA-ish
      const data = {lat:34.05, lon:-118.32, t:Date.now()};
      localStorage.setItem(GEO_KEY, JSON.stringify(data));
      resolve(data);
    }, {enableHighAccuracy:false, maximumAge: 6*60*60*1000, timeout:8000});
  });
}

async function getWeather(lat, lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const r = await fetch(url);
  const j = await r.json();
  return {
    temp: Math.round(j.current.temperature_2m),
    wind: Math.round(j.current.wind_speed_10m)
  };
}

(async function initWeather(){
  const geo = await getGeo();
  document.getElementById('coords').textContent = `${geo.lat.toFixed(2)}, ${geo.lon.toFixed(2)}`;
  try{
    const w = await getWeather(geo.lat, geo.lon);
    document.getElementById('temp').textContent = `${w.temp}°`;
    document.getElementById('wind').textContent = w.wind;
  }catch(e){
    document.getElementById('temp').textContent = `--°`;
    document.getElementById('wind').textContent = `--`;
  }
})();

/* Joystick */
(function joystick(){
  const stick = document.getElementById('stick');
  const knob  = document.getElementById('knob');
  const rBase = stick.clientWidth/2;
  const rKnob = knob.clientWidth/2;
  let center = {x: stick.offsetLeft + rBase, y: stick.offsetTop + rBase};
  function setKnob(dx, dy){
    knob.style.left = (rBase + dx - rKnob) + "px";
    knob.style.top  = (rBase + dy - rKnob) + "px";
  }
  function handle(e){
    const rect = stick.getBoundingClientRect();
    center = {x: rect.left + rBase, y: rect.top + rBase};
    const p = ('touches' in e ? e.touches[0] : e);
    const dx = p.clientX - center.x;
    const dy = p.clientY - center.y;
    const dist = Math.min(Math.hypot(dx,dy), rBase - rKnob - 4);
    const ang = Math.atan2(dy, dx);
    setKnob(Math.cos(ang)*dist, Math.sin(ang)*dist);
    // emit vector later if needed
  }
  function end(){ setKnob(0,0); }
  stick.addEventListener('mousedown', e=>{ handle(e); window.addEventListener('mousemove', handle); window.addEventListener('mouseup', ()=>{window.removeEventListener('mousemove', handle); end();}, {once:true}); });
  stick.addEventListener('touchstart', e=>{ handle(e); window.addEventListener('touchmove', handle, {passive:false}); window.addEventListener('touchend', ()=>{window.removeEventListener('touchmove', handle); end();}, {once:true}); }, {passive:false});
})();
