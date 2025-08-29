
const $ = (q, c=document)=>c.querySelector(q);
const grid = $('#grid');
const people = (window.__PEOPLE__ || []);

// Build UI Avatars URL (first-name only, rounded, dark background)
function avatarURL(name){
  const n = encodeURIComponent(name);
  // UI Avatars (no key): https://ui-avatars.com/
  return `https://ui-avatars.com/api/?name=${n}&background=1b2130&color=e9edf6&bold=true&size=128&format=png`;
}

function card(p){
  const wrap = document.createElement('article'); wrap.className = 'card';

  const row = document.createElement('div'); row.className = 'row';
  const avatar = document.createElement('div'); avatar.className = 'avatar';
  const img = new Image(); img.loading = 'lazy'; img.alt = `${p.name} avatar`;
  img.src = avatarURL(p.name);
  img.onerror = ()=>{ img.remove(); avatar.textContent = (p.name[0]||'?').toUpperCase(); };
  avatar.appendChild(img);

  const name = document.createElement('div'); name.className = 'name'; name.textContent = p.name;
  const since = document.createElement('div'); since.className = 'since'; since.textContent = p.ring || '—';

  row.append(avatar, name, since);

  const actions = document.createElement('div'); actions.className = 'actions';
  const knock = document.createElement('button'); knock.className = 'btn knock'; knock.textContent='knock';
  const prove = document.createElement('button'); prove.className = 'btn prove'; prove.textContent='prove';
  knock.addEventListener('click', ()=>toast(`👋 knock → ${p.name}`));
  prove.addEventListener('click', ()=>toast(`✅ proof ping → ${p.name}`));
  actions.append(knock, prove);

  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = 'ring = days since proof';

  wrap.append(row, actions, meta);
  return wrap;
}

function render(){
  grid.innerHTML = '';
  people.forEach(p => grid.appendChild(card(p)));
}

// Small toast
function toast(msg){
  let t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=> t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 250); }, 1600);
}

// Geo + weather pill (Open-Meteo)
async function geoinit(){
  const pill = document.getElementById('geoPill');
  if(!pill) return;
  if(!('geolocation' in navigator)){ pill.textContent='Geo off'; return; }

  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude:lat, longitude:lon} = pos.coords;
    try{
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&timezone=auto`);
      const data = await r.json();
      const t = data?.current?.temperature_2m;
      const w = data?.current?.wind_speed_10m;
      pill.textContent = (t!=null) ? `📍 ${Math.round(t)}° • wind ${Math.round(w??0)}` : 'Geo ready';
    }catch{ pill.textContent='Geo error'; }
  }, ()=>{ pill.textContent='Geo denied'; }, {maximumAge:600000, timeout:8000});
}

document.addEventListener('DOMContentLoaded', ()=>{
  render();
  geoinit();
});
