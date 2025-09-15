"use strict"

function FiveDays() {
  const appid = getAppid();
  function dayNight(sr, ss, h) {
    let dn;
    if (sr <= h && h <= ss) { dn = '-d'; } else { dn = '-n'; }
    return dn;
  }

  function tempColour(temp) {
    const ranges = [-Infinity, 0, 5, 10, 15, 20, 25];
    const colors = ['#00ffff', '#3399ff', '#3366cc', '#3319ff', '#ff6600', '#ff0000', '#993300'];
    for (let i = ranges.length - 1; i >= 0; i--) {
      if (temp >= ranges[i]) return colors[i];
    }
  }

  function cloudColour(cloud) {
    const ranges = [0, 20, 40, 60, 80];
    const colors = ['#eeeeee', '#dddddd', '#cccccc', '#bbbbbb', '#aaaaaa'];
    for (let i = ranges.length - 1; i >= 0; i--) {
      if (cloud >= ranges[i]) return colors[i];
    }
  }

  function wndSpdColour(wndSpd) {
    const ranges = [0, 2, 5, 7, 9, 12, 14, 17, 20, 25];
    const colors = [
      '#888',
      '#555',
      '#333',
      '#b3b300',
      '#ff9900',
      '#b36b00',
      '#ff5050',
      '#e60000',
      '#800000;font-weight:bold',
      '#ff0000;font-weight:bold',
    ];
    for (let i = ranges.length - 1; i >= 0; i--) {
      if (wndSpd >= ranges[i]) return colors[i];
    }
  }

  function getWndDir(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.floor(((degrees + 11.25) % 360) / 22.5);
    return directions[index];
  }

  function convertSpd(spd) {
    let s;
    if (units.speed === 'kt') {
      s = spd * 1.944;
    } else if (units.speed == 'mph') {
      s = spd * 2.236936;
    } else if (units.speed === 'Bf') {
      s = (spd / 0.836) ** (2 / 3)
    }
    return s;
  }

  function convertTemp(temp) {
    let t;
    if (units.temp === 'F') {
      t = ((temp * 1.8) + 32);
    }
    else {
      t = temp;
    }
    return t;
  }

  function initWidget(data) {
    let sunrise = new Date((data.city.sunrise + data.city.timezone) * 1000);
    let sunset = new Date((data.city.sunset + data.city.timezone) * 1000);
    sunrise = new Date(sunrise);
    const sunriseHour = sunrise.getUTCHours().toString().padStart(2, 0);
    sunset = new Date(sunset);
    const sunsetHour = sunset.getUTCHours().toString().padStart(2, 0);

    for (let i = 0; i < 40; i++) {
      let time = (data.list[i].dt + data.city.timezone) * 1000;
      const temp = convertTemp(data.list[i].main.temp - 273.15).toFixed(1);
      const tbg = tempColour(data.list[i].main.temp -273.15);

      const symbol = data.list[i].weather[0].icon;
      const cond = data.list[i].weather[0].description;
      let cloud = data.list[i].clouds.all;
      const wndSpd = convertSpd(data.list[i].wind.speed).toFixed(0);
      const wsp = wndSpdColour(data.list[i].wind.speed);
      let gust;
      if (data.list[i].wind.gust) {
        gust = data.list[i].wind.gust;
        gust = '/' + convertSpd(gust).toFixed(0);
      } else {
        gust = '';
      }
      let wndDir = getWndDir(data.list[i].wind.deg);
      let prs = data.list[i].main.pressure;
      let rain;
      if (data.list[i]['rain']) {
        rain = data.list[i]['rain']['3h'].toFixed(1);
      } else rain = '0';

      if (rain > 0) {
        rain = `<b>${rain}mm</b>`;
      } else {
        rain = '0mm';
      }

      time = new Date(time);
      const ftime = time.getHours().toString().padStart(2, 0);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
      const day = days[time.getDay()];

      const dn = dayNight(Number(sunriseHour), Number(sunsetHour), ftime);
      let dnColour;
      if (dn === '-d') dnColour = 'style="background-color:#fff"';
      else if (dn === '-n') dnColour = 'style="background-color:#ddd"';

      document.getElementById('forecast').innerHTML +=
        `<tr class="forecast"${dnColour}><td><strong>${day} ${ftime}h</strong></td>
             <td style="padding-right:3px;color:${tbg}"><strong>${temp}&deg;${units.temp}</strong></td>
             <td><image src="PNG/${symbol}.png" alt="${cond}" width="30" height="30"></td>
             <td style="font-variant:small-caps;">${cond}</td><td>${rain}</td>
             <td style="background-color: ${cloudColour(cloud)}">${cloud}&percnt;</td><td style="color:${wsp}">${wndSpd}${gust}${units.speed}</td><td>${wndDir}</td><td>${prs}mb</td></tr>`;
    }
  }

  const vars = JSON.parse(localStorage.getItem('vars'));
  const units = JSON.parse(localStorage.getItem('units'));

  const { lat, lon, place } = vars;

  document.getElementById('container').innerHTML = 
    `<table>
      <thead>
        <tr><td colspan="3"><button class="back_button" onclick="history.back()">Go back</button></td>
          <td colspan="6"><h3>5 day forecast for ${place}</h3></td></tr>
        <tr>
          <td></td>
          <td>Temp</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>Rain</td>
          <td>Cloud</td>
          <td>Wind</td>
          <td>Dir</td>
          <td>Pres</td>
        </tr>
      </thead>
      <tbody id="forecast">`;

  document.getElementById('container').innerHTML += 
    `</tbody>
   </table>`

  if (lat && lon && appid) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('Network error'), 5000);
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appid}`,
      { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then(result => initWidget(result))
      .catch(err => alert(`Error: ${err}`))
  }
}

const fiveDays = new FiveDays();
