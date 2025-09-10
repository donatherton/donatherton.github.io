"use strict";

function dayNight(sr, ss, h) {
  let dn;
  if (sr <= h && h <= ss) { dn = '-d'; } else { dn = '-n'; }
  return dn;
}

function get_wnd_dir(wnd) {
  let wndDir = wnd;
  switch (true) {
    case (wndDir <= 11):  wndDir = 'N'; break;
    case (wndDir > 11 && wndDir <= 33): wndDir = 'NNE'; break;
    case (wndDir > 33 && wndDir <= 56):  wndDir = 'NE'; break;
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

function wndSpdColour(wndSpd) {
  let Wsp;
  switch (true) {
    case wndSpd < 5: Wsp = '#888'; break;
    case wndSpd >= 5 && wndSpd < 10: Wsp = '#555'; break;
    case wndSpd >= 10 && wndSpd < 15: Wsp = '#333'; break;
    case wndSpd >= 15 && wndSpd < 20: Wsp = '#b3b300'; break;
    case wndSpd >= 20 && wndSpd < 25: Wsp = '#ff9900'; break;
    case wndSpd >= 25 && wndSpd < 30: Wsp = '#b36b00'; break;
    case wndSpd >= 30 && wndSpd < 35: Wsp = '#ff5050'; break;
    case wndSpd >= 35 && wndSpd < 40: Wsp = '#e60000'; break;
    case wndSpd >= 40 && wndSpd < 50: Wsp = '#800000;font-weight:bold'; break;
    case wndSpd >= 50: Wsp = '#ff0000;font-weight:bold';
  }
  return Wsp;
}

function tempColour(temp) {
  let Tbg;
  switch (true) {
    case temp < 0: Tbg = '#00ffff'; break;
    case temp >= 0 && temp < 5: Tbg = '#3399ff'; break;
    case temp >= 5 && temp < 10: Tbg = '#3366cc'; break;
    case temp >= 10 && temp < 15: Tbg = '#3319ff'; break;
    case temp >= 15 && temp < 20: Tbg = '#ff6600'; break;
    case temp >= 20 && temp < 25: Tbg = '#ff0000'; break;
    case temp >= 25: Tbg = '#993300';
  }
  return Tbg;
}

function cloudColour(cloud) {
  let Clbg;
  switch (true) {
    case cloud >= 0 && cloud < 20: Clbg = '#eeeeee'; break;
    case cloud >= 20 && cloud < 40: Clbg = '#dddddd'; break;
    case cloud >= 40 && cloud < 60: Clbg = '#cccccc'; break;
    case cloud >= 60 && cloud < 80: Clbg= '#bbbbbb'; break;
    case cloud >= 80: Clbg = '#aaaaaa';
  }
  return Clbg;
}

function initWidget(result) {
  const data = JSON.parse(result);

  const fc = data.hourly;

  for (let i = 0; i < 48; i++) {
    const ts = fc[i].dt + data.timezone_offset;
    const temp = Math.round(fc[i].temp * 10) / 10;
    const symbol = fc[i].weather[0].icon;
    const cond = fc[i].weather[0].description;
    const wndSpd = Math.round(fc[i].wind_speed * 1.944);
    const wndDir = fc[i].wind_deg;
    let gust;
    if  (fc[i].wind_gust) {
      gust = fc[i].wind_gust;
      gust = `/${Math.round(gust * 1.944)}`;
    } else {
      gust = '';
    }
    const pres = fc[i].pressure;
    let rain;
    if (fc[i].rain) {
      rain = `<b>${Math.round((fc[i].rain['1h']) * 10) / 10}mm</b>`;
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
          <td style="padding-right:3px;color:${tempColour(temp)}"><strong>${temp}&deg;C</strong></td>
          <td><image src="PNG/${symbol}.png" alt="${cond}" width="30" height="30"></td>
          <td style="font-variant:small-caps;">${cond}</td><td>${rain}</td>
          <td style="background-color: ${cloudColour(cloud)}">${cloud}&percnt;</td><td style="color:${wndSpdColour(wndSpd)}">
    ${wndSpd}${gust}kt</td><td>${get_wnd_dir(wndDir)}</td><td>${pres}mb</td></tr>`;
  }
}

const place = JSON.parse(localStorage.getItem('vars')).place;

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

