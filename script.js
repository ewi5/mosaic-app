function updateTime(){
  const now = new Date();
  document.getElementById("time").textContent = now.toLocaleTimeString();
}
setInterval(updateTime,1000);
updateTime();

// Location
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(pos=>{
    document.getElementById("location").textContent = "📍 " + 
      pos.coords.latitude.toFixed(2) + ", " + pos.coords.longitude.toFixed(2);
  });
}

// Mock weather
document.getElementById("weather").textContent = "26° · wind 6";
