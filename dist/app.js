const $=id=>document.getElementById(id);
let apiKey='',unit='C',busy=false,request=0;
const today=new Date();$('date').textContent=today.toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
let data={name:'Bengaluru, IN',timezone:19800,dt:Math.floor(Date.now()/1000),temp:26,feels:28,min:21,max:28,description:'Partly cloudy',humidity:64,wind:12,deg:225,visibility:10,sunrise:0,sunset:0,hours:Array.from({length:40},(_,i)=>({dt:Math.floor(Date.now()/1000)+i*10800,temp:24+Math.sin(i*.8)*4,min:21+Math.sin(i*.8)*3,max:27+Math.sin(i*.8)*3,icon:i%4===0?'rain':i%3===0?'sun':'cloud',pop:i%4===0?.4:.1}))};
const temp=v=>Math.round(unit==='C'?v:v*9/5+32)+'°';
const symbol=x=>x==='rain'?'🌧':x==='sun'?'☀️':x==='snow'?'❄️':'⛅';
const icon=w=>w.id<600?'rain':w.id<700?'snow':w.id===800?'sun':'cloud';
function localDate(dt){return new Date((dt+data.timezone)*1000)}
function clock(dt){return localDate(dt).toLocaleTimeString('en',{hour:'numeric',minute:'2-digit',timeZone:'UTC'})}
function render(){
 $('city').textContent=data.name;$('temperature').textContent=temp(data.temp);$('condition').textContent=data.description;$('feels').textContent=`Feels like ${temp(data.feels)} · H ${temp(data.max)} L ${temp(data.min)}`;
 $('wind').textContent=Math.round(data.wind);$('humidity').textContent=data.humidity;$('visibility').textContent=data.visibility;
 $('detail-humidity').innerHTML=`${data.humidity}<span>%</span>`;$('humidity-meter').style.width=data.humidity+'%';$('detail-wind').innerHTML=`${Math.round(data.wind)}<span> km/h</span>`;$('detail-visibility').innerHTML=`${data.visibility}<span> km</span>`;
 const directions=['north','northeast','east','southeast','south','southwest','west','northwest'];$('direction').textContent='From the '+directions[Math.round((data.deg||0)/45)%8];
 $('sunset').textContent=data.sunset?clock(data.sunset):'6:04 PM';$('sunrise').textContent='Sunrise at '+(data.sunrise?clock(data.sunrise):'6:18 AM');
 $('hours').replaceChildren(...data.hours.slice(0,8).map((h,i)=>{const el=document.createElement('div');el.className='hour';el.innerHTML=`<span>${clock(h.dt)}</span><span class="symbol">${symbol(h.icon)}</span><b>${temp(h.temp)}</b><span class="rain">♧ ${Math.round(h.pop*100)}%</span>`;return el}));
 const groups=new Map();const dateKey=dt=>localDate(dt).toISOString().slice(0,10);const currentDay=dateKey(data.dt);
 for(const h of data.hours){const k=dateKey(h.dt);if(k===currentDay)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(h)}
 $('daily').replaceChildren(...[...groups.values()].slice(0,5).map((day,i)=>{const mid=day.reduce((a,b)=>Math.abs(localDate(a.dt).getUTCHours()-12)<Math.abs(localDate(b.dt).getUTCHours()-12)?a:b);const el=document.createElement('div');el.className='daily-row';el.innerHTML=`<span>${i===0?'Tomorrow':localDate(mid.dt).toLocaleDateString('en',{weekday:'long',timeZone:'UTC'})}</span><span class="day-weather">${symbol(mid.icon)}</span><span class="range"></span><span class="daily-temp"><span class="low">${temp(Math.min(...day.map(h=>h.min)))}</span>${temp(Math.max(...day.map(h=>h.max)))}</span>`;return el}));
 $('celsius').classList.toggle('selected',unit==='C');$('fahrenheit').classList.toggle('selected',unit==='F');
}
function message(s){$('status').textContent=s}
async function get(path,params){const url=new URL('https://api.openweathermap.org/'+path);Object.entries({...params,appid:apiKey}).forEach(([k,v])=>url.searchParams.set(k,v));const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(r.status===401?'API key is invalid or not yet activated. Check your OpenWeather account.':r.status===429?'OpenWeather request limit reached. Please try again later.':'Weather service unavailable. Please try again.');return r.json()}
async function load(coords,name){const id=++request;busy=true;$('search').querySelector('button').disabled=true;message('Finding your forecast…');try{if(!coords){const cities=await get('geo/1.0/direct',{q:name,limit:1});if(!cities.length)throw new Error('City not found. Try adding a country code, such as Paris, FR.');coords=cities[0]}
 const [w,f]=await Promise.all([get('data/2.5/weather',{lat:coords.lat,lon:coords.lon,units:'metric'}),get('data/2.5/forecast',{lat:coords.lat,lon:coords.lon,units:'metric'})]);if(id!==request)return;
 data={name:`${w.name}${w.sys.country?', '+w.sys.country:''}`,timezone:w.timezone,dt:w.dt,temp:w.main.temp,feels:w.main.feels_like,min:w.main.temp_min,max:w.main.temp_max,description:w.weather[0].description.replace(/^./,c=>c.toUpperCase()),humidity:w.main.humidity,wind:w.wind.speed*3.6,deg:w.wind.deg,visibility:Math.round(w.visibility/100)/10,sunrise:w.sys.sunrise,sunset:w.sys.sunset,hours:f.list.map(h=>({dt:h.dt,temp:h.main.temp,min:h.main.temp_min,max:h.main.temp_max,icon:icon(h.weather[0]),pop:h.pop||0}))};render();$('mode').textContent='LIVE WEATHER';$('local-time').textContent='Local time · '+clock(w.dt);message(`Updated ${clock(w.dt)} local time · Forecast at 3-hour intervals · Daily ranges based on available forecast intervals.`)
 }catch(e){if(id===request)message(e.name==='TimeoutError'?'The request timed out. Please try again.':e.message)}finally{if(id===request){busy=false;$('search').querySelector('button').disabled=false}}}
 $('settings').onclick=()=>$('dialog').showModal();$('close').onclick=()=>$('dialog').close();
 $('key-form').onsubmit=e=>{e.preventDefault();apiKey=$('key').value.trim();if(!apiKey)return;$('key').value='';$('dialog').close();load(null,$('city-input').value.trim()||'Bengaluru, IN')};
 $('search').onsubmit=e=>{e.preventDefault();if(busy)return;if(!apiKey){$('dialog').showModal();return}load(null,$('city-input').value.trim())};
 $('celsius').onclick=()=>{unit='C';render()};$('fahrenheit').onclick=()=>{unit='F';render()};
 $('locate').onclick=()=>{if(!apiKey){$('dialog').showModal();return}if(!navigator.geolocation){message('Geolocation is unavailable. Search for your city instead.');return}message('Waiting for your location…');navigator.geolocation.getCurrentPosition(p=>load({lat:p.coords.latitude,lon:p.coords.longitude}),()=>message('Location could not be accessed. Search for your city instead.'),{timeout:12000})};
render();
