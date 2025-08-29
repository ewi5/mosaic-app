const people = [
  { name: "viv" },
  { name: "mom" },
  { name: "dad" },
  { name: "sis" },
  { name: "bro" },
  { name: "gabe" },
  { name: "lang" },
  { name: "helen" }
];

const main = document.getElementById('cards');

people.forEach(p => {
  const card = document.createElement('div');
  card.className = 'card';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = p.name[0].toUpperCase();
  card.appendChild(avatar);

  const label = document.createElement('div');
  label.textContent = p.name;
  card.appendChild(label);

  const knock = document.createElement('button');
  knock.className = 'knock';
  knock.textContent = 'knock';
  card.appendChild(knock);

  const prove = document.createElement('button');
  prove.className = 'prove';
  prove.textContent = 'prove';
  card.appendChild(prove);

  main.appendChild(card);
});

// Geo & Weather (mockup for now)
const loc = document.getElementById('location');
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    loc.textContent = `📍 ${latitude.toFixed(2)}, ${longitude.toFixed(2)} • wind 3`;
  });
} else {
  loc.textContent = "📍 location unavailable";
}
