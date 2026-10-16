const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = "runway.personal.flights.v1";
const SETTINGS_KEY = "runway.personal.settings.v1";
const airports = [
 {code:"DFW",city:"Dallas–Fort Worth",country:"United States",tz:"America/Chicago",tips:"Large hub with Skylink train between terminals. Allow extra time for terminal transfers."},
 {code:"DEN",city:"Denver",country:"United States",tz:"America/Denver",tips:"All concourses connect to the Jeppesen terminal by train. Mountain weather can affect operations."},
 {code:"JFK",city:"New York",country:"United States",tz:"America/New_York",tips:"Check your terminal before leaving; terminal transfers can take time."},
 {code:"LAX",city:"Los Angeles",country:"United States",tz:"America/Los_Angeles",tips:"Terminal connections vary; allow time for landside transfers and traffic."},
 {code:"SFO",city:"San Francisco",country:"United States",tz:"America/Los_Angeles",tips:"AirTrain links terminals and rental car facilities. Fog can affect operations."},
 {code:"ORD",city:"Chicago O’Hare",country:"United States",tz:"America/Chicago",tips:"Use the airport transit system for terminal transfers; winter weather can cause delays."},
 {code:"ATL",city:"Atlanta",country:"United States",tz:"America/New_York",tips:"The Plane Train connects concourses; check the concourse on your boarding pass."},
 {code:"SEA",city:"Seattle–Tacoma",country:"United States",tz:"America/Los_Angeles",tips:"The underground train links the main terminal and concourses."},
 {code:"LHR",city:"London Heathrow",country:"United Kingdom",tz:"Europe/London",tips:"Terminal changes may require a bus or train; check transfer requirements."},
 {code:"CDG",city:"Paris Charles de Gaulle",country:"France",tz:"Europe/Paris",tips:"Terminal layout is spread out; verify the terminal and connection route."},
 {code:"DXB",city:"Dubai International",country:"United Arab Emirates",tz:"Asia/Dubai",tips:"Large transfer hub. Check terminal and minimum connection time with your airline."},
 {code:"BOM",city:"Mumbai",country:"India",tz:"Asia/Kolkata",tips:"Chhatrapati Shivaji Maharaj International Airport has separate domestic/international terminal areas."},
 {code:"DEL",city:"Delhi",country:"India",tz:"Asia/Kolkata",tips:"Verify terminal carefully; domestic and international operations may use different terminals."},
 {code:"DOH",city:"Doha Hamad",country:"Qatar",tz:"Asia/Qatar",tips:"Transfer signs are prominent; follow the transfer route and check gate screens."},
 {code:"SIN",city:"Singapore Changi",country:"Singapore",tz:"Asia/Singapore",tips:"Terminal connections are available by Skytrain and walking routes, depending on terminals."},
 {code:"HND",city:"Tokyo Haneda",country:"Japan",tz:"Asia/Tokyo",tips:"Check whether your flight uses Terminal 2 or 3; international transfers vary."}
];
const sampleFlights = [
 {id:"sample-1",flight:"AA100",airline:"American Airlines",origin:"DFW",destination:"JFK",date:futureDate(4),miles:1391,status:"upcoming",sample:true},
 {id:"sample-2",flight:"QR730",airline:"Qatar Airways",origin:"DFW",destination:"DOH",date:futureDate(18),miles:8040,status:"upcoming",sample:true},
 {id:"sample-3",flight:"UA218",airline:"United Airlines",origin:"DEN",destination:"SFO",date:pastDate(28),miles:967,status:"completed",sample:true}
];
let activeFilter = "all";
let settings = load(SETTINGS_KEY, {apiKey:"",showDemo:true});
let flights = load(STORAGE_KEY, null);
if (!Array.isArray(flights)) flights = settings.showDemo ? structuredClone(sampleFlights) : [];
function futureDate(days){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function pastDate(days){const d=new Date();d.setDate(d.getDate()-days);return d.toISOString().slice(0,10)}
function load(key, fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(flights));render()}
function saveSettings(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function niceDate(date){if(!date)return "Date not set";const d=new Date(date+"T12:00:00");return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}
function getAirport(code){return airports.find(a=>a.code===String(code||"").toUpperCase())}
function statusLabel(s){return ({upcoming:"Upcoming",completed:"Completed",cancelled:"Cancelled",live:"Live status"})[s]||s||"Saved"}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2600)}
function render(){
 const real=flights.filter(f=>!f.sample);
 const shown=flights.filter(f=>activeFilter==="all"||f.status===activeFilter);
 $("#statFlights").textContent=real.length;
 $("#statAirports").textContent=new Set(real.flatMap(f=>[f.origin,f.destination]).filter(Boolean)).size;
 $("#statMiles").textContent=real.reduce((n,f)=>n+(Number(f.miles)||0),0).toLocaleString();
 $("#flightList").innerHTML=shown.length?shown.sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(f=>{
  const o=getAirport(f.origin), d=getAirport(f.destination);
  return `<article class="flight-card" data-flight-id="${escapeHTML(f.id)}" tabindex="0" role="button" aria-label="View ${escapeHTML(f.flight)} details">
   <div class="flight-top"><div><div class="airline-name">${escapeHTML(f.airline||"Airline not specified")}</div><div class="flight-number">${escapeHTML(f.flight)}${f.sample?' · SAMPLE':''}</div></div><span class="status-pill ${escapeHTML(f.status)}">${escapeHTML(statusLabel(f.status))}</span></div>
   <div class="route"><div><div class="airport-code">${escapeHTML(f.origin)}</div><div class="city-name">${escapeHTML(o?.city||"Origin airport")}</div></div><div class="route-line">✈</div><div class="route-end"><div class="airport-code">${escapeHTML(f.destination)}</div><div class="city-name">${escapeHTML(d?.city||"Destination airport")}</div></div></div>
   <div class="flight-bottom"><span>◷ <b>${escapeHTML(niceDate(f.date))}</b></span><span>${f.miles?`↗ <b>${Number(f.miles).toLocaleString()} mi</b>`:"Distance not set"}</span></div>
  </article>`;
 }).join(""):`<div class="empty-state"><strong>Your flight journal starts here.</strong>Add a flight to build your personal history. Your records stay on this device.</div>`;
 $$(".flight-card").forEach(card=>{const open=()=>showFlight(card.dataset.flightId);card.addEventListener("click",open);card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}})});
 renderAirports($("#airportSearch").value||"");
 $("#apiStatus").textContent=settings.apiKey?"API key saved · live lookup enabled":"Demo mode · add an API key for live lookup";
}
function renderAirports(q=""){
 const query=q.trim().toLowerCase();
 const matches=airports.filter(a=>[a.code,a.city,a.country,a.tz].some(v=>v.toLowerCase().includes(query))).slice(0,12);
 $("#airportGrid").innerHTML=matches.map(a=>`<article class="airport-card"><div class="code">${a.code}</div><div class="city">${escapeHTML(a.city)}</div><div class="country">${escapeHTML(a.country)}</div><div class="timezone">${escapeHTML(a.tz)}</div><button data-airport="${a.code}">Airport guide ↗</button></article>`).join("")||`<div class="empty-state">No airport in the built-in guide matched. Try a code such as DFW, LHR, or BOM.</div>`;
 $$("[data-airport]").forEach(b=>b.addEventListener("click",()=>showAirport(b.dataset.airport)));
}
function showFlight(id){
 const f=flights.find(x=>x.id===id);if(!f)return;
 const o=getAirport(f.origin),d=getAirport(f.destination);
 $("#detailContent").innerHTML=`<div class="modal-head"><div><div class="eyebrow muted">FLIGHT DETAILS</div><h2>${escapeHTML(f.flight)}</h2></div><button class="close-btn" data-close="detailDialog">×</button></div>
 <div class="flight-top"><span class="airline-name">${escapeHTML(f.airline||"Airline not specified")}</span><span class="status-pill ${escapeHTML(f.status)}">${escapeHTML(statusLabel(f.status))}</span></div>
 <div class="detail-route"><div><strong>${escapeHTML(f.origin)}</strong><div class="city-name">${escapeHTML(o?.city||"Origin")}</div></div><span style="color:var(--blue)">✈ ───›</span><div style="text-align:right"><strong>${escapeHTML(f.destination)}</strong><div class="city-name">${escapeHTML(d?.city||"Destination")}</div></div></div>
 ${detailRow("Departure date",niceDate(f.date))}${detailRow("Distance",f.miles?Number(f.miles).toLocaleString()+" miles":"Not provided")}${detailRow("Origin time zone",o?.tz||"Not in guide")}${detailRow("Destination time zone",d?.tz||"Not in guide")}
 <p class="muted-note">${f.sample?"This is sample content for preview. Remove it or replace it with your own flight record.":"Saved locally on this device. Live operational status is not implied by this saved record."}</p>
 <div class="detail-actions"><button class="primary-btn" id="editFlight">Edit</button><button class="danger-btn" id="deleteFlight">Delete</button></div>`;
 $("#detailDialog").showModal();
 $("#deleteFlight").onclick=()=>{if(confirm("Delete this flight from your local journal?")){flights=flights.filter(x=>x.id!==id);persist();$("#detailDialog").close();toast("Flight deleted")}};
 $("#editFlight").onclick=()=>{ $("#detailDialog").close();openAddFlight(f)};
 wireCloseButtons();
}
function detailRow(k,v){return `<div class="detail-row"><span>${escapeHTML(k)}</span><b>${escapeHTML(v)}</b></div>`}
function showAirport(code){
 const a=getAirport(code);if(!a)return;
 $("#detailContent").innerHTML=`<div class="modal-head"><div><div class="eyebrow muted">AIRPORT INTELLIGENCE</div><h2>${a.code} · ${escapeHTML(a.city)}</h2></div><button class="close-btn" data-close="detailDialog">×</button></div>
 <div class="notice"><b>${escapeHTML(a.country)}</b><p>${escapeHTML(a.tz)}</p></div><div class="detail-row"><span>Local time</span><b>${new Intl.DateTimeFormat(undefined,{timeZone:a.tz,hour:"numeric",minute:"2-digit",hour12:true}).format(new Date())}</b></div><h3>Traveler notes</h3><p class="muted-note">${escapeHTML(a.tips)}</p><p class="muted-note">This is a curated quick-reference guide, not live terminal, security wait, gate, or disruption data. Always verify with the airport and airline.</p>`;
 $("#detailDialog").showModal();wireCloseButtons();
}
function wireCloseButtons(){$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close())}
function openAddFlight(f=null){
 const form=$("#addFlightForm");form.reset();
 form.elements.date.value=f?.date||futureDate(1);
 form.elements.flight.value=f?.flight||"";
 form.elements.origin.value=f?.origin||"";
 form.elements.destination.value=f?.destination||"";
 form.elements.airline.value=f?.airline||"";
 form.elements.miles.value=f?.miles||"";
 form.elements.status.value=f?.status||"upcoming";
 form.dataset.editId=f?.sample?"":(f?.id||"");
 if(f?.sample)toast("Sample entries are read-only. Add your own flight instead.");
 if(f?.sample)return;
 $("#flightDialog").showModal();
}
async function lookupFlight(code){
 const result=$("#liveResult");result.classList.remove("hidden");result.innerHTML=`<div class="eyebrow">LIVE LOOKUP</div><p>Looking up ${escapeHTML(code)}…</p>`;
 if(!settings.apiKey){result.innerHTML=`<div class="live-top"><div class="eyebrow">DEMO MODE</div><span class="status-pill upcoming">No live data</span></div><h3>${escapeHTML(code.toUpperCase())}</h3><p>Connect an Aviationstack API key in Settings to request live flight information. No fabricated status is shown here.</p><button class="primary-btn" id="liveSettings">Configure API key</button>`;$("#liveSettings").onclick=()=>$("#settingsDialog").showModal();return}
 try{
  const url=`https://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(settings.apiKey)}&flight_iata=${encodeURIComponent(code.toUpperCase())}`;
  const res=await fetch(url);if(!res.ok)throw new Error("The aviation data service returned HTTP "+res.status);
  const data=await res.json();if(data.error)throw new Error(data.error.message||"The provider returned an API error");
  const f=data.data?.[0];if(!f)throw new Error("No flight was returned. Check the flight number or API plan.");
  const dep=f.departure||{},arr=f.arrival||{},air=f.airline||{},st=f.flight_status||"Unknown";
  result.innerHTML=`<div class="live-top"><div class="eyebrow">AVIATIONSTACK RESULT</div><span class="status-pill ${st==="cancelled"?"cancelled":"upcoming"}">${escapeHTML(st)}</span></div><h3>${escapeHTML(air.name||"Airline")} · ${escapeHTML(f.flight?.iata||code.toUpperCase())}</h3><div class="detail-route"><div><strong>${escapeHTML(dep.iata||"—")}</strong><div class="city-name">${escapeHTML(dep.airport||"Departure")}</div></div><span style="color:var(--blue)">✈ ─›</span><div style="text-align:right"><strong>${escapeHTML(arr.iata||"—")}</strong><div class="city-name">${escapeHTML(arr.airport||"Arrival")}</div></div></div><p>Departure: ${escapeHTML(dep.scheduled||"Not supplied")} · Gate ${escapeHTML(dep.gate||"—")}<br>Arrival: ${escapeHTML(arr.scheduled||"Not supplied")} · Gate ${escapeHTML(arr.gate||"—")}<br>Terminal and times are provider-reported; confirm with your airline.</p><button class="primary-btn" id="saveLookup">Save to my journal</button>`;
  $("#saveLookup").onclick=()=>{flights.unshift({id:crypto.randomUUID(),flight:f.flight?.iata||code.toUpperCase(),airline:air.name||"",origin:dep.iata||"",destination:arr.iata||"",date:(dep.scheduled||"").slice(0,10)||futureDate(1),miles:0,status:"upcoming"});persist();toast("Flight saved to your journal");result.scrollIntoView({behavior:"smooth",block:"nearest"})};
 }catch(err){result.innerHTML=`<div class="eyebrow">LOOKUP UNAVAILABLE</div><h3>${escapeHTML(code.toUpperCase())}</h3><p>${escapeHTML(err.message||"Could not fetch live data.")}</p><p>Some free plans restrict HTTPS, fields, or request quotas; browser CORS may also block direct requests. Your local journal still works.</p>`}
}
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();const code=$("#flightSearch").value.trim().toUpperCase().replace(/\s+/g,"");if(!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(code)){toast("Enter a flight number such as AA100");return}lookupFlight(code)});
$("#addFlightOpen").onclick=()=>openAddFlight();
$("#addFlightForm").addEventListener("submit",e=>{
 e.preventDefault();const form=e.currentTarget;const d=new FormData(form);const id=form.dataset.editId;
 const item={id:id||crypto.randomUUID(),flight:String(d.get("flight")).trim().toUpperCase(),airline:String(d.get("airline")).trim(),origin:String(d.get("origin")).trim().toUpperCase(),destination:String(d.get("destination")).trim().toUpperCase(),date:String(d.get("date")),miles:Number(d.get("miles"))||0,status:String(d.get("status"))};
 if(item.origin===item.destination){toast("Origin and destination must differ");return}
 if(id)flights=flights.map(f=>f.id===id?item:f);else flights.unshift(item);
 persist();$("#flightDialog").close();toast(id?"Flight updated":"Flight added");
});
$$(".filter").forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));render()});
$("#airportSearch").addEventListener("input",e=>renderAirports(e.target.value));
$("#settingsOpen").onclick=$("#navSettings").onclick=()=>{const f=$("#settingsForm");f.elements.apiKey.value=settings.apiKey||"";f.elements.showDemo.checked=!!settings.showDemo;$("#settingsDialog").showModal()};
$("#settingsForm").addEventListener("submit",e=>{e.preventDefault();const f=e.currentTarget;settings.apiKey=f.elements.apiKey.value.trim();settings.showDemo=f.elements.showDemo.checked;saveSettings();$("#settingsDialog").close();render();toast("Settings saved on this device")});
$("#clearData").onclick=()=>{if(confirm("Permanently delete all locally saved flights and settings from this browser?")){flights=[];settings={apiKey:"",showDemo:false};localStorage.removeItem(STORAGE_KEY);saveSettings();$("#settingsDialog").close();render();toast("Local flight data deleted")}};
$("#exportBtn").onclick=exportData;
$("#historyTool").onclick=()=>{$("#flightList").scrollIntoView({behavior:"smooth",block:"start"});activeFilter="all";$$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter==="all"));render()};
$("#dataTool").onclick=()=>{const choice=confirm("Export a JSON backup now? Press Cancel to restore from a backup file.");if(choice)exportData();else $("#importFile").click()};
function exportData(){const blob=new Blob([JSON.stringify({app:"Runway Personal Flight Companion",version:1,exportedAt:new Date().toISOString(),flights:flights.filter(f=>!f.sample),settings:{showDemo:settings.showDemo}},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="runway-flight-backup.json";a.click();URL.revokeObjectURL(url);toast("Backup exported")}
// CSV import accepts common header variants from airline, travel, and flight-tracking exports.
function parseCSV(text){
 const rows=[];let row=[],cell="",quoted=false;
 text=text.replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){
  const c=text[i],n=text[i+1];
  if(quoted){
   if(c==='"'&&n==='"'){cell+='"';i++}
   else if(c==='"')quoted=false;
   else cell+=c;
  }else{
   if(c==='"'&&cell==="")quoted=true;
   else if(c===","){row.push(cell.trim());cell=""}
   else if(c==="\n"){row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row);row=[];cell=""}
   else if(c!=="\r")cell+=c;
  }
 }
 if(quoted)throw new Error("CSV contains an unclosed quoted field");
 if(cell!==""||row.length){row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row)}
 if(rows.length<2)throw new Error("CSV needs a header row and at least one flight row");
 const headers=rows.shift().map(h=>h.trim().toLowerCase().replace(/[\s_-]+/g," "));
 return rows.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,(cells[i]||"").trim()])));
}
function pick(row,names){for(const name of names){const key=Object.keys(row).find(k=>k===name||k.replace(/[^a-z0-9]/g,"")===name.replace(/[^a-z0-9]/g,""));if(key&&row[key])return row[key]}return ""}
function normalizeDate(raw){
 if(!raw)return "";
 const s=raw.trim();
 if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
 const m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
 if(m){let a=+m[1],b=+m[2],y=+m[3];if(y<100)y+=y<50?2000:1900;
  // Ambiguous slash dates default to US month/day/year; if first part cannot be a month, treat as day/month/year.
  let month=a,day=b;if(a>12){day=a;month=b}
  const d=new Date(y,month-1,day);if(d.getFullYear()===y&&d.getMonth()===month-1&&d.getDate()===day)return `${y}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
 }
 const d=new Date(s);return Number.isNaN(d.getTime())?"":d.toISOString().slice(0,10);
}
function csvFlights(text){
 const rows=parseCSV(text);
 const converted=rows.map((r,i)=>{
  const flight=pick(r,["flight","flight number","flight no","flight iata","flight code","callsign","number"]);
  const origin=pick(r,["origin","from","departure airport","departure iata","origin airport","from airport","dep airport"]);
  const destination=pick(r,["destination","to","arrival airport","arrival iata","destination airport","to airport","arr airport"]);
  const date=normalizeDate(pick(r,["date","departure date","flight date","scheduled departure","departure time","departure datetime","departure scheduled","start date"]));
  const airline=pick(r,["airline","airline name","carrier","operator"]);
  const rawMiles=pick(r,["miles","distance","distance miles","flight miles"]);
  const miles=Number(String(rawMiles).replace(/[, ]/g,""))||0;
  const rawStatus=pick(r,["status","flight status"]);
  const stat=rawStatus.toLowerCase();
  const status=/cancel/.test(stat)?"cancelled":/complete|landed|arrived|past|flown/.test(stat)?"completed":/upcoming|scheduled|booked|future/.test(stat)?"upcoming":(date&&date<new Date().toISOString().slice(0,10)?"completed":"upcoming");
  return {flight:flight.toUpperCase().replace(/\s+/g,""),origin:origin.toUpperCase().trim(),destination:destination.toUpperCase().trim(),date,airline,miles,status,_row:i+2};
 }).filter(f=>f.flight||f.origin||f.destination);
 const valid=converted.filter(f=>f.flight&&f.origin&&f.destination);
 if(!valid.length)throw new Error("No usable flights found. CSV needs columns for flight number, origin, and destination. See the sample format in the app.");
 return {valid,skipped:converted.length-valid.length};
}
$("#importFile").onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const content=await file.text();let clean=[],skipped=0;
  if(file.name.toLowerCase().endsWith(".csv")||content.trimStart().startsWith("flight,")||content.trimStart().startsWith("Flight,")){
   const parsed=csvFlights(content);clean=parsed.valid;skipped=parsed.skipped;
  }else{
   const obj=JSON.parse(content);if(!Array.isArray(obj.flights))throw new Error("JSON backup has no flights array");
   clean=obj.flights.filter(f=>f&&f.flight&&f.origin&&f.destination).map(f=>({flight:String(f.flight).toUpperCase(),origin:String(f.origin).toUpperCase(),destination:String(f.destination).toUpperCase(),date:normalizeDate(f.date),airline:String(f.airline||""),miles:Number(f.miles)||0,status:["upcoming","completed","cancelled"].includes(f.status)?f.status:"upcoming"}));
   skipped=obj.flights.length-clean.length;
  }
  const summary=`Import ${clean.length} flights${skipped?` (${skipped} invalid rows skipped)`:""}? This adds them to your current journal.`;
  if(confirm(summary)){flights=[...clean.map(f=>({...f,id:crypto.randomUUID(),sample:false})),...flights.filter(f=>!f.sample)];persist();toast(`${clean.length} flights imported`)}
 }catch(err){toast("Could not import: "+err.message)}
 e.target.value="";
};
$("#installTool").onclick=async()=>{if(window.deferredInstall){window.deferredInstall.prompt();await window.deferredInstall.userChoice;window.deferredInstall=null}else toast("On iPhone: tap Share in Safari, then Add to Home Screen.")};
$("#apiTool").onclick=()=>$("#settingsOpen").click();
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close());
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.deferredInstall=e});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
