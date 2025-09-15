"use strict";

function Widget() {
  const appid = getAppid();
  // Get location from local storage if it's there, defaults if not
  const vars = JSON.parse(localStorage.getItem('vars')) || {"lat": 50, "lon": -5, "place": "Falmouth"};
  // If units in storage ok or set defaults
  localStorage.units || localStorage.setItem('units', '{"temp": "C", "speed": "mph"}');
  const units = JSON.parse(localStorage.getItem('units'));

  initSearchForm();
  loadUrlParams();
  saveVars();
  callApi();

  function initWidget() {
    const tempPrefs = ['C', 'F'];
    const tempUnit = units.temp; // Example selected temperature unit
    const tempPrefsDiv = generateRadioButtons(tempPrefs, tempUnit, 'tempUnits');

    const spdPrefs = ['mph', 'kt', 'Bf'];
    const spdUnit = units.speed; // Example selected speed unit
    const spdPrefsDiv = generateRadioButtons(spdPrefs, spdUnit, 'spdUnits');

    let result = JSON.parse(sessionStorage.getItem('weather_data'));
    let data = result.current;

    let d = new Date((data.dt + result.timezone_offset) * 1000);
    const h = d.getUTCHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');

    const temp = convertTemp(data.temp, tempUnit).toFixed(1);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const windSpd = convertSpd(data.wind_speed, spdUnit).toFixed(0);
    const gust = calcGust(data.wind_gust, spdUnit);        
    const windDir = getWndDir(data.wind_deg);
    const pres = data.pressure;
    const hum = data.humidity

    const sunrise = new Date((data.sunrise + result.timezone_offset) * 1000);
    const sunriseHour = sunrise.getUTCHours().toString().padStart(2, '0');
    const sunriseMin = sunrise.getMinutes().toString().padStart(2, '0');
    const sunset = new Date((data.sunset + result.timezone_offset) * 1000);
    const sunsetHour = sunset.getUTCHours().toString().padStart(2, '0');
    const sunsetMin = sunset.getMinutes().toString().padStart(2, '0');

    document.getElementById('container').innerHTML =
      `<table><tbody>
      <tr><td colspan="3" style="padding:10px;"><h3>${vars.place}</h3>
      <h3>${temp}&deg;${tempUnit}</h3>
      <p style="font-variant:small-caps;">${desc}<br>
      <img src="PNG/${icon}.png" width="60" height="60" alt="${desc}"></p></td>
      <td colspan="4" style="padding:10px;"><p>Wind: ${windSpd}${gust}${spdUnit} ${windDir}<br>
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
      const dayArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      d = new Date(data[i].dt * 1000).getDay();
      d = dayArray[d];

      const tempMax = convertTemp(data[i].temp.max).toFixed(0);
      const tempMin = convertTemp(data[i].temp.min).toFixed(0);
      const dailyDesc = data[i].weather[0].description.toUpperCase();
      const dailyIcon = data[i].weather[0].icon;
      const dailyWindSpd = convertSpd(data[i].wind_speed, spdUnit).toFixed(0);
      const dailyGust = calcGust(data[i].wind_gust, spdUnit);
      const dailyWindDir = getWndDir(data[i].wind_deg);
      let rain;
      if (data[i].rain) {
        rain = data[i].rain.toFixed(1);
      } else rain = '0';
      const POP = Math.round(data[i].pop * 100);
      const dailyPres = Math.round(data[i].pressure);

      document.getElementById('forecast').innerHTML +=
        `<td><table><tr><td>${d}</td></tr>
       <tr><td title="Min/max temp">${tempMax}/${tempMin}&deg;${tempUnit}</td></tr>
       <tr><td title="${dailyDesc}">
       <img src="PNG/${dailyIcon}.png"
       width="30" height="30"
       alt="${dailyDesc}"
       title="${dailyDesc}"></td></tr>
       <tr><td title="Wind speed/gust">${dailyWindSpd}${dailyGust}${spdUnit}</td></tr>
       <tr><td title="Wind direction">${dailyWindDir}</td></tr>
       <tr><td title="Chance of rain">${POP}&percnt;</td></tr>
       <tr><td title="Amount of rain">${rain}mm</td></tr>
       <tr><td title="Pressure">${dailyPres}mb</td></tr>
     </table>`;
    }
    document.getElementById('container').innerHTML += '</td></tr></tbody></table></div>';

    document.getElementById('footer').innerHTML =
      `<p><a href='hourly.html'>Hourly 48h</a>
         <a href="5-days.html">3 hourly 5 days</a>
         <a href="radar.html">Rainfall radar</a></p>
         <div id="tempPrefs">
          ${tempPrefsDiv}
         </div>
         <div id="spdPrefs">
          ${spdPrefsDiv}
         </div>
       <p>Weather data provided by <a href="https://openweathermap.org/" target="_blank">OpenWeather</a></p>`;
    document.getElementById('tempUnits').addEventListener('change', changeUnits);
    document.getElementById('spdUnits').addEventListener('change', changeUnits);
  }

  function calcGust(gust, spdUnit) {
    let g;
    if (gust > 0) { g = `/${convertSpd(gust, spdUnit).toFixed(0)}`; } else g = '';
    return g;
  }

  function generateRadioButtons(prefs, selectedUnit, name) {
    let prefsDiv = `<form id="${name}">`;
    for (const pref of prefs) {
      const checked = (pref === selectedUnit) ? 'checked' : '';
      prefsDiv += `<label><input type="radio" name="${name}" value="${pref}"  ${checked}>${pref}</label>`;
    }
    prefsDiv += '</form>';
    return prefsDiv;
  }

  function convertSpd(spd, spdUnit) {
    let s;
    switch (spdUnit) {
      case ('mph'): s = spd * 2.236936; break;
      case ('kt'): s = spd * 1.944; break;
      case ('Bf'): s = (spd / 0.836) ** (2 / 3);
    }
    return s;
  }

  function convertTemp(temp, tempUnit) {
    let t;
    if (tempUnit === 'F') {
      t = ((temp * 1.8) + 32);
    }
    else {
      t = temp;
    }
    return t;
  }

  function getWndDir(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.floor(((degrees + 11.25) % 360) / 22.5);
    return directions[index];
  }

  function changeUnits(e) {
    const tmp = units;
    if (e.target.name === 'tempUnits') {
      tmp.temp = e.target.value;
    } else tmp.speed = e.target.value;
    localStorage.setItem('units', JSON.stringify(tmp));
    initWidget();
  }

  function getLocation(result) {
    document.getElementById('results').innerHTML = '';

    if (result.length > 0) {
      result.forEach(res => {
        document.getElementById('results').innerHTML +=
          `<p><a href="index.html?lat=${res.lat}&lon=${res.lon}&place=${res.name}">${res.name}, ${res.state}, ${res.country}</a></p>`;
      });
    } else document.getElementById('results').innerHTML = '<p>No results</p>';
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

  function initSearchForm() {
    document.getElementById('search').innerHTML = 
      `<form id="searchForm">
      <p><label for="loc">Location search </label>
        <input id="loc" type="text" name="loc"></p>
      <p><input type="submit" name="submit" value="OK"></p>
   </form>
   <div id="results"></div>`;
    document.getElementById('searchForm').addEventListener('submit', searchLocation);
  }

  // If url has parameters (after search) change to those
  function loadUrlParams() {
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
      vars[key] = decodeURI(value);
    });
  };

  function saveVars() {
    const { lat, lon, place } = vars;
    if (lat && lon && place) {
      localStorage.setItem('vars', JSON.stringify(vars));
    }
  }

  function callApi() {
    //Send request for data
    const { lat, lon } = vars;
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
  }
}

const widget = new Widget();
