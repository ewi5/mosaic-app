
/* --- CONFIG & DATA --- */
const PEOPLE = [
  { name:"viv", initials:"vv", days:8 },
  { name:"mom", initials:"mm", days:7 },
  { name:"dad", initials:"dd", days:7 },
  { name:"sis", initials:"si", days:2 },
  { name:"bro", initials:"br", days:5 },
  { name:"gabe", initials:"ga", days:6 },
  { name:"lang", initials:"ll", days:3 },
  { name:"helen", initials:"hh", days:8 },
  { name:"ryan", initials:"rr", days:8 },
  { name:"kai", initials:"kk", days:6 },
];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

/* --- Apple-ish contact color (deterministic) --- */
const APPLE_COLORS = [
  "#f44336","#e91e63","#9c27b0","#673ab7","#3f51b5","#2196f3",
  "#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39",
  "#ffc107","#ff9800","#ff5722","#795548","#607d8b"
];
function colorForName(name){
  let h=0; for (let i=0;i<name.length;i++) h = (h*31 + name.charCodeAt(i))>>>0;
  return APPLE_COLORS[h % APPLE_COLORS.length];
}

/* --- Render cards --- */
function render(){
  const grid = document.getElementById('building');
  grid.innerHTML = "";
  PEOPLE.forEach(p=>{
    const card = document.createElement('article');
    card.className = "card";
    card.innerHTML = `
      <div class="header">
        <div class="avatar" style="background:${colorForName(p.name)}">${p.name.slice(0,1)}</div>
        <div class="nameRow">
          <div class="name">${p.name}</div>
        </div>
      </div>
      <div class="days">days since pol: ${p.days}</div>
      <div class="controls">
        <button class="pill">knock</button>
        <button class="pol"></button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* --- Stars canvas --- */
function makeStars(){
  const c = document.getElementById('stars');
  if(!c) return;
  const ctx = c.getContext('2d');
  const w = c.width = c.clientWidth;
  const h = c.height = Math.max(400, c.clientHeight);
  ctx.clearRect(0,0,w,h);
  const count = Math.floor(w*h/6500);
  for(let i=0;i<count;i++){
    const x = Math.random()*w, y=Math.random()*h;
    const r = Math.random()*1.2+0.3;
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.8+0.2})`;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
}

/* --- Weather + location (Open-Meteo) --- */
async function getLocation(){
  const cache = localStorage.getItem("locCache");
  if (cache){
    try{
      const obj = JSON.parse(cache);
      if(Date.now()-obj.t < 12*3600*1000) return obj;
    }catch(e){}
  }
  try{
    const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:8000}));
    const obj={ lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2), t: Date.now() };
    localStorage.setItem("locCache", JSON.stringify(obj));
    return obj;
  }catch(e){
    return { lat: "--", lon:"--", t: Date.now() };
  }
}
async function getWeather(lat, lon){
  if(lat==="--") return { temp:"--", wind:"--" };
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&timezone=auto`;
  const r = await fetch(url); const j = await r.json();
  return {
    temp: Math.round(j?.current?.temperature_2m ?? 0),
    wind: Math.round(j?.current?.wind_speed_10m ?? 0)
  };
}
function setHUD({lat,lon,temp,wind}){
  document.getElementById('coords').textContent = `${lat}, ${lon}`;
  document.getElementById('temp').textContent = `${temp}°`;
  document.getElementById('wind').textContent = `wind ${wind}`;
}
function tickClock(){
  const now = new Date();
  const s = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  document.getElementById('clock').textContent = s;
}

/* --- Joystick (visual only) --- */
function setupJoystick(){
  const joy = document.getElementById('joystick');
  const nub = joy.querySelector('.nub');
  let origin=null;
  function pos(e){
    const t = (e.touches?e.touches[0]:e);
    return {x:t.clientX, y:t.clientY};
  }
  function start(e){
    origin = pos(e); e.preventDefault();
    document.addEventListener('mousemove',move,{passive:false});
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('mouseup',end);
    document.addEventListener('touchend',end);
  }
  function move(e){
    if(!origin) return;
    const p = pos(e);
    const dx = clamp(p.x-origin.x, -26, 26);
    const dy = clamp(p.y-origin.y, -26, 26);
    nub.style.transform = `translate(${dx}px, ${dy}px)`;
  }
  function end(){
    origin = null;
    nub.style.transform = 'translate(0,0)';
    document.removeEventListener('mousemove',move);
    document.removeEventListener('touchmove',move);
    document.removeEventListener('mouseup',end);
    document.removeEventListener('touchend',end);
  }
  joy.addEventListener('mousedown', start);
  joy.addEventListener('touchstart', start, {passive:false});
}

/* --- Init --- */
async function init(){
  render();
  makeStars();
  window.addEventListener('resize', makeStars, {passive:true});
  setupJoystick();

  tickClock(); setInterval(tickClock, 1000);
  const loc = await getLocation();
  const w = await getWeather(loc.lat, loc.lon);
  setHUD({lat:loc.lat, lon:loc.lon, temp:w.temp, wind:w.wind});
}
document.addEventListener('DOMContentLoaded', init);
