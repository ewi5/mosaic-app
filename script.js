const names = [
  'viv','mom','dad','sis','bro','gabe','lang','helen','tulio','nina','ryan','kai'
];

function render(){
  const grid = document.getElementById('grid');
  const tpl = document.getElementById('card-template');
  names.forEach((n)=>{
    const node = tpl.content.cloneNode(true);
    node.querySelector('.avatar').textContent = n[0].toUpperCase();
    node.querySelector('.name').textContent = n;
    node.querySelector('.knock').addEventListener('click',()=>alert(`Knocked on ${n}'s window ✊`));
    node.querySelector('.prove').addEventListener('click',()=>alert(`Requested proof of life from ${n} ✅`));
    grid.appendChild(node);
  });
}

document.addEventListener('DOMContentLoaded', render);
