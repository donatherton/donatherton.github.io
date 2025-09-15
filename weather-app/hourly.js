"use strict";

function Hourly() {
  function dayNight(sr, ss, h) {
    let dn;
    if (sr <= h && h <= ss) { dn = '-d'; } else { dn = '-n'; }
    return dn;
  }

  function getWndDir(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.floor(((degrees + 11.25) % 360) / 22.5);
    return directions[index];
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

  function initWidget(result) {
    const data = JSON.parse(result);

    const fc = data.hourly;

    for (let i = 0; i < 48; i++) {
      const ts = fc[i].dt + data.timezone_offset;
      const temp = convertTemp(fc[i].temp).toFixed(1);
      const tbg = tempColour(fc[i].temp);
      const symbol = fc[i].weather[0].icon;
      const cond = fc[i].weather[0].description;
      const wndSpd = convertSpd(fc[i].wind_speed).toFixed(0);
      const wsp = wndSpdColour(fc[i].wind_speed);
      const wndDir = fc[i].wind_deg;
      let gust;
      if  (fc[i].wind_gust) {
        gust = fc[i].wind_gust;
        gust = `/${convertSpd(gust).toFixed(0)}`;
      } else {
        gust = '';
      }
      const pres = fc[i].pressure;
      let rain;
      if (fc[i].rain) {
        rain = `<b>${fc[i].rain['1h'].toFixed(1)}mm</b>`;
      } else {
        rain = '0mm';
      }
      const cloud = fc[i].clouds;

      let sunrise = data.current.sunrise;
      let sunset = data.current.sunset;

      const time = new Date(ts * 1000);
      const ftime = time.getHours().toString().padStart(2, 0);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
      const day = days[time.getDay()];

      sunrise = new Date(sunrise * 1000);
      const sunriseHour = sunrise.getHours().toString().padStart(2, 0);
      sunset = new Date(sunset * 1000);
      const sunsetHour = sunset.getHours().toString().padStart(2, 0);

      const dn = dayNight(Number(sunriseHour), Number(sunsetHour), ftime);
      let dnColour;
      if (dn === '-d') {
        dnColour = 'style="background-color:#fff"';
      } else if (dn === '-n') {
        dnColour = 'style="background-color:#ddd"';
      }

      document.getElementById('forecast').innerHTML +=
        `<tr class="forecast"${dnColour}><td><strong>${day} ${ftime}h</strong></td>
          <td style="padding-right:3px;color:${tbg}"><strong>${temp}&deg;${units.temp}</strong></td>
          <td><image src="PNG/${symbol}.png" alt="${cond}" width="30" height="30"></td>
          <td style="font-variant:small-caps;">${cond}</td><td>${rain}</td>
          <td style="background-color: ${cloudColour(cloud)}">${cloud}&percnt;</td><td style="color:${wsp}">
    ${wndSpd}${gust}${units.speed}</td><td>${getWndDir(wndDir)}</td><td>${pres}mb</td></tr>`;
    }
  }

  const place = JSON.parse(localStorage.getItem('vars')).place;
  const units = JSON.parse(localStorage.getItem('units'));

  document.getElementById('container').innerHTML = 
    `<table>
      <thead>
        <tr><td colspan="3"><button class="back_button" onclick="history.back()">Go back</button></td>
          <td colspan="6"><h3>48 hour forecast for ${place}</h3></td></tr>
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

  initWidget(sessionStorage.getItem('weather_data'));
}

const hourly = new Hourly();
