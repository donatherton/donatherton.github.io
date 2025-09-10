"use strict";

function getWndDir(wnd) {
  let wndDir = wnd;
  switch (true) {
    case (wndDir <= 11):   wndDir = 'N'; break;
    case (wndDir > 11 && wndDir <= 33): wndDir = 'NNE'; break;
    case (wndDir > 33 && wndDir <= 56):   wndDir = 'NE'; break;
    case (wndDir > 56 && wndDir <= 78): wndDir = 'ENE'; break;
    case (wndDir > 78 && wndDir <= 101): wndDir = 'E'; break;
    case (wndDir > 101 && wndDir <= 123): wndDir = 'ESE'; break;
    case (wndDir > 123 && wndDir <= 146): wndDir = 'SE'; break;
    case (wndDir > 146 && wndDir <= 168): wndDir = 'SSE'; break;
    case (wndDir > 168 && wndDir <= 190): wndDir = 'S'; break;
    case (wndDir > 190 && wndDir <= 213): wndDir = 'SSW'; break;
    case (wndDir > 213 && wndDir <= 235): wndDir = 'SW'; break;
    case (wndDir > 235 && wndDir <= 258): wndDir = 'WSW'; break;
    case (wndDir > 258 && wndDir <= 280): wndDir = 'W'; break;
    case (wndDir > 280 && wndDir <= 303): wndDir = 'WNW'; break;
    case (wndDir > 303 && wndDir <= 325): wndDir = 'NW'; break;
    case (wndDir > 325 && wndDir <= 347): wndDir = 'NNW'; break;
    case (wndDir > 347 && wndDir <= 360): wndDir = 'N';
  }
  return wndDir;
}

function initWidget() {

  function calcGust(gust) {
    if (gust > 0) { gust = `/${Math.round(gust * 1.944)}`; } else gust = '';
    return gust;
  }

  let unit;
  let Cchecked = 'checked';
  let Fchecked;
  const units = localStorage.getItem('units');
  units === 'F' ? unit = units : unit = 'C';

  function setUnits(t) {
    let temp;
    if (unit === 'F') {
      temp = ((t * 1.8) + 32);
      Fchecked = 'checked';
    }
    else {
      temp = t;
      Cchecked = 'checked';
    }
    return temp;
  }

  let result = JSON.parse(sessionStorage.getItem('weather_data'));
  let data = result.current;

  let d = new Date(data.dt * 1000);
  const h = d.getHours().toString().padStart(2, 0);
  const m = d.getMinutes().toString().padStart(2, 0);
  const s = d.getSeconds().toString().padStart(2, 0);

  const temp = setUnits(data.temp).toFixed(1);
  const desc = data.weather[0].description;
  const icon = data.weather[0].icon;
  const windSpd = Math.round(data.wind_speed * 1.944);
  const gust = calcGust(data.wind_gust);        
  const windDir = getWndDir(data.wind_deg);
  const pres = data.pressure;
  const hum = data.humidity

  const sunrise = new Date(data.sunrise * 1000);
  const sunriseHour = sunrise.getHours().toString().padStart(2, 0);
  const sunriseMin = sunrise.getMinutes().toString().padStart(2, 0);
  const sunset = new Date(data.sunset * 1000);
  const sunsetHour = sunset.getHours().toString().padStart(2, 0);
  const sunsetMin = sunset.getMinutes().toString().padStart(2, 0);

  document.getElementById('container').innerHTML =
   `<table><tbody>
    <tr><td colspan="3" style="padding:10px;"><h3>${place}</h3>
    <h3>${temp}&deg;${unit}</h3>
    <p style="font-variant:small-caps;">${desc}<br>
    <img src="PNG/${icon}.png" width="60" height="60" alt="${desc}"></p></td>
    <td colspan="4" style="padding:10px;"><p>Wind: ${windSpd}${gust}kt ${windDir}<br>
    Pressure: ${pres}mb<br>
    Humidity: ${hum}&percnt;</p>
    <p>Sunrise: ${sunriseHour}:${sunriseMin}<br>Sunset: ${sunsetHour}:${sunsetMin}</p>
    <p>Updated: ${h}:${m}:${s}</p></td></tr>
    <tr id="forecast">`;
document.getElementById('searchForm').addEventListener('submit', searchLocation);

  // 7 day forecast;
  data = result.daily;

  document.getElementById('forecast').innerHTML = '';

  for (let i = 0; i < 5; i++) {
    d = new Date(data[i].dt * 1000);
    d = d.getDay();
    switch (d) {
      case 0: d = 'Sun'; break;
      case 1: d = 'Mon'; break;
      case 2: d = 'Tue'; break;
      case 3: d = 'Wed'; break;
      case 4: d = 'Thu'; break;
      case 5: d = 'Fri'; break;
      case 6: d = 'Sat';
    }

    const tempMax = setUnits(data[i].temp.max).toFixed(0);
    const tempMin = setUnits(data[i].temp.min).toFixed(0);
    const dailyDesc = data[i].weather[0].description.toUpperCase();
    const dailyIcon = data[i].weather[0].icon;
    const dailyWindSpd = Math.round(data[i].wind_speed * 1.944);
    const dailyGust = calcGust(data[i].wind_gust);
    const dailyWindDir = getWndDir(data[i].wind_deg);
    let rain;
    if (data[i].rain) {
      rain = data[i].rain.toFixed(1);
    } else rain = '0';
    const POP = Math.round(data[i].pop * 100);
    const dailyPres = Math.round(data[i].pressure);

  document.getElementById('forecast').innerHTML +=
   `<td><table><tr><td>${d}</td></tr>
    <tr><td title="Min/max temp">${tempMax}/${tempMin}&deg;${unit}</td></tr>
    <tr><td title="${dailyDesc}">
    <img src="PNG/${dailyIcon}.png"
    width="30" height="30"
    alt="${dailyDesc}"
    title="${dailyDesc}"></td></tr>
    <tr><td title="Wind speed/gust">${dailyWindSpd}${dailyGust}kt</td></tr>
    <tr><td title="Wind direction">${dailyWindDir}</td></tr>
    <tr><td title="Chance of rain">${POP}&percnt;</td></tr>
    <tr><td title="Amount of rain">${rain}mm</td></tr>
    <tr><td title="Pressure">${dailyPres}mb</td></tr>
    </table>`;
  }
  document.getElementById('container').innerHTML += '</td></tr></tbody></table></div>';

  document.getElementById('footer').innerHTML =
    `<p><a href='hourly.html'>Hourly 48h</a>
       <a href="5-days.html?lat=${lat}&lon=${lon}&place=${place}">3 hourly 5 days</a>
       <a href="radar.html?lat=${lat}&lon=${lon}">Rainfall radar</a></p>
       <label><input type="radio" name="units" value="C" ${Cchecked} onchange="getUnits()">Celsius</label>
       <label><input type="radio" name="units" value="F" ${Fchecked} onchange="getUnits()">Fahrenheit</label>       
     <p>Weather data provided by <a href="https://openweathermap.org/" target="_blank">OpenWeather</a></p>`;
}

document.getElementById('search').innerHTML = 
  `<form id="searchForm">
      <p><label for="loc">Location search </label>
        <input id="loc" type="text" name="loc"></p>
      <p><input type="submit" name="submit" value="OK"></p>
   </form>
   <div id="results"></div>`;

function getLocation(result) {
  document.getElementById('results').innerHTML = '';
  
  if (result.length > 0) {
    for (let i = 0; i < result.length; i++) {
      document.getElementById('results').innerHTML +=
        `<p><a href="index.html?lat=${result[i].lat}&lon=${result[i].lon}&place=${result[i].name}">${result[i].name}, ${result[i].state}, ${result[i].country}</a></p>`;
    }
  } else document.getElementById('results').innerHTML = '<p>No results</p>';
}

function getUnits() {
  const units = document.getElementsByName('units');
  units.forEach(unit => {
    if (unit.checked) localStorage.setItem('units', unit.value);
    });
  initWidget();
}

function searchLocation(e) {
  e.preventDefault(); // Needed to stop calling new html doc on submit which cancels fetch

  const loc = document.getElementById('loc').value;
  const controller = new AbortController();
  setTimeout(() => controller.abort('Network error'), 5000);
  
  if (loc && appid) {
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${loc}&limit=5&appid=${appid}`,
    { signal: controller.signal })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then(result => getLocation(result))
    .catch(err => alert(`Error: ${err}`))
  }
}

document.getElementById('searchForm').addEventListener('submit', searchLocation);

// Get location from local storage if it's there, empty object if not
const vars = JSON.parse(localStorage.getItem('vars')) || {};
// If url has parameters (after search) change to those
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => vars[key] = decodeURI(value));

const { lat } = vars;
const { lon } = vars;
const { place } = vars;

if (lat && lon && place) {
  localStorage.setItem('vars', JSON.stringify(vars));
}

//Send request for data
if (lat && lon && appid) {
  const controller = new AbortController();
  setTimeout(() => controller.abort('Network error'), 5000);
  fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${appid}`,
    { signal: controller.signal })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then(result => {
      sessionStorage.setItem("weather_data", JSON.stringify(result));
      initWidget()
    })
    .catch(err => alert(`Error: ${err}`))
}
