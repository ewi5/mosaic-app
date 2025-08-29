// demo people
const people = [
  { name: "viv",   daysSincePol: 8, home: true  },
  { name: "mom",   daysSincePol: 7, home: false },
  { name: "dad",   daysSincePol: 7, home: true  },
  { name: "sis",   daysSincePol: 2, home: true  },
  { name: "bro",   daysSincePol: 5, home: false },
  { name: "gabe",  daysSincePol: 6, home: true  },
  { name: "helen", daysSincePol: 9, home: false },
  { name: "kai",   daysSincePol: 6, home: true  },
  { name: "nina",  daysSincePol: 8, home: false },
  { name: "ryan",  daysSincePol: 8, home: true  },
  { name: "tulio", daysSincePol: 7, home: false },
  { name: "lang",  daysSincePol: 3, home: true  },
];

// Deterministic Apple-ish color for initials
const palette = ["#f4a261","#e76f51","#e07a5f","#f2c94c","#6fcf97","#56ccf2","#2d9cdb","#9b51e0","#bb6bd9","#eb5757","#27ae60","#f2994a"];
function hashString(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return Math.abs(h);}
const colorForName = n => palette[hashString(n.toLowerCase()) % palette.length];

function initialsFor(name){
  const parts = name.trim().toLowerCase().split(/\s+/);
  return (parts.length===1) ? parts[0][0]+parts[0][0] : (parts[0][0] + parts[1][0]);
}

function render(){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  people.forEach(p=>{
    const card = document.createElement("section");
    card.className = `card ${p.home ? "home":"away"}`;
    const row  = document.createElement("div"); row.className="row";
    const av   = document.createElement("div"); av.className="avatar";
    av.style.background = colorForName(p.name);
    av.textContent = initialsFor(p.name);
    const nm   = document.createElement("div"); nm.className="name"; nm.textContent = p.name.toLowerCase();
    row.append(av,nm);

    const days = document.createElement("div"); days.className="days";
    days.textContent = `days since pol: ${p.daysSincePol}`;

    const controls = document.createElement("div"); controls.className="controls";
    const knock = document.createElement("button"); knock.className="btn btn-knock"; knock.textContent="knock";
    knock.onclick = ()=> card.animate([{transform:"scale(1)"},{transform:"scale(.98)"},{transform:"scale(1)"}],{duration:150});
    const pol   = document.createElement("button"); pol.className="btn btn-pol"; pol.textContent="pol";
    pol.onclick = ()=> { p.daysSincePol=0; days.textContent="days since pol: 0"; };

    controls.append(knock, pol);
    card.append(row, days, controls);
    grid.append(card);
  });
}
render();

// SKY: city • temp° • time (no wind, no coords)
const citySpan = document.getElementById("city");
const tempSpan = document.getElementById("temp");
const timeSpan = document.getElementById("time");

function tickTime(){
  const d = new Date();
  timeSpan.textContent = d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
tickTime(); setInterval(tickTime, 30000);

// caching helpers
const CACHE_HOURS_POS = 24;
const CACHE_MIN_TEMP = 60;
const getCache = k => { try{return JSON.parse(localStorage.getItem(k))}catch{return null} };
const setCache = (k,v) => localStorage.setItem(k, JSON.stringify(v));

async function geolocate(){
  const pos = getCache("mosaic_last_pos");
  if (pos && (Date.now()-pos.t) < CACHE_HOURS_POS*3600*1000){
    citySpan.textContent = getCache("mosaic_city")?.name || "auto";
    tempSpan.textContent = await temperatureFromCacheOrFetch(pos.lat, pos.lon);
    return;
  }
  if (!navigator.geolocation){ citySpan.textContent="auto"; tempSpan.textContent="—"; return; }
  navigator.geolocation.getCurrentPosition(async ({coords})=>{
    const lat = +coords.latitude.toFixed(4), lon = +coords.longitude.toFixed(4);
    setCache("mosaic_last_pos", {lat,lon,t:Date.now()});
    const city = await reverseGeocodeCity(lat,lon);
    setCache("mosaic_city", {name:city, t:Date.now()});
    citySpan.textContent = city;
    tempSpan.textContent = await temperatureFromCacheOrFetch(lat,lon);
  }, _err => { citySpan.textContent="auto"; tempSpan.textContent="—"; },
  {enableHighAccuracy:false, timeout:6000, maximumAge:3600_000});
}

async function reverseGeocodeCity(lat,lon){
  try{
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    const j = await res.json();
    return (j.address.city || j.address.town || j.address.village || j.address.county || j.address.state || "auto").toLowerCase();
  }catch{ return "auto"; }
}

async function temperatureFromCacheOrFetch(lat,lon){
  const c = getCache("mosaic_last_temp");
  if (c && (Date.now()-c.t)<CACHE_MIN_TEMP*60*1000) return c.temp;
  try{
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const j = await r.json();
    const t = Math.round(j.current_weather.temperature);
    setCache("mosaic_last_temp",{temp:t,t:Date.now()}); return t;
  }catch{ return getCache("mosaic_last_temp")?.temp ?? "—"; }
}
geolocate();
