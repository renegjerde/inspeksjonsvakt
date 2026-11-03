const STORAGE_KEY = "inspeksjonsvakt-v1";\nlet weekOffset = 0;
const $ = id => document.getElementById(id);
let inspections = [];
let favorite = localStorage.getItem("iv-favorite") || "";
let pdfjs = null;

async function loadPdfJs(){
  if(!pdfjs){
    try { pdfjs = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"); }
    catch(e){ console.warn("PDF.js could not load",e); }
  }
  return pdfjs;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function saveLocal(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(inspections));
  $("saveStatus").textContent = `Lagret ${inspections.length} inspeksjon(er) på denne enheten.`;
  render();
}
function renderRows(){
  const body=$("inspectionRows");
  body.innerHTML="";
  inspections.forEach((x,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td><input type="date" data-i="${i}" data-k="date" value="${esc(x.date)}"></td>
      <td><input type="time" data-i="${i}" data-k="start" value="${esc(x.start)}"></td>
      <td><input type="time" data-i="${i}" data-k="end" value="${esc(x.end)}"></td>
      <td><input type="text" data-i="${i}" data-k="name" value="${esc(x.name)}" placeholder="Navn"></td>
      <td><input type="text" data-i="${i}" data-k="area" value="${esc(x.area)}" placeholder="Område"></td>
      <td><button class="delete" data-delete="${i}" aria-label="Slett inspeksjon">×</button></td>`;
    body.appendChild(tr);
  });
  body.querySelectorAll("input").forEach(inp=>inp.addEventListener("change",e=>{
    const i=+e.target.dataset.i,k=e.target.dataset.k; inspections[i][k]=e.target.value; refreshNames(); render();
  }));
  body.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{inspections.splice(+btn.dataset.delete,1);renderRows();refreshNames();render();}));
}
function refreshNames(){
  const names=[...new Set(inspections.map(x=>x.name.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"no"));
  const select=$("personSelect"), current=select.value || favorite;
  select.innerHTML='<option value="">Velg navn fra planen</option>'+names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
  if(names.includes(current)) select.value=current;
  $("favoriteBtn").textContent=select.value===favorite && favorite ? "★":"☆";
}
function dateTime(x){return new Date(`${x.date}T${x.start || "00:00"}:00`);}
function mondayOf(date){
  const d=new Date(date); d.setHours(0,0,0,0);
  const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d;
}
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function renderWeek(name){
  const base=mondayOf(new Date());base.setDate(base.getDate()+weekOffset*7);
  const end=new Date(base);end.setDate(base.getDate()+6);
  const fmt=d=>d.toLocaleDateString("no-NO",{day:"numeric",month:"short"});
  $("weekTitle").textContent=weekOffset===0?"Denne uken":`${fmt(base)} – ${fmt(end)}`;
  const days=["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"];
  const records=inspections.filter(x=>x.name===name);
  $("weekGrid").innerHTML=days.map((day,i)=>{
    const d=new Date(base);d.setDate(base.getDate()+i);
    const key=dateKey(d), entries=records.filter(x=>x.date===key).sort((a,b)=>(a.start||"").localeCompare(b.start||""));
    const today=dateKey(new Date())===key;
    return `<div class="week-day ${today?"is-today":""}"><div class="week-day-head"><span>${day}</span><strong>${d.getDate()}</strong></div>
      ${entries.length?entries.map(x=>`<div class="week-event"><b>${esc(x.start||"—")}${x.end?"–"+esc(x.end):""}</b><span>${esc(x.area||"Område mangler")}</span></div>`).join(""):'<div class="week-empty">Fri</div>'}
    </div>`;
  }).join("");
}
function render(){
  const name=$("personSelect").value;
  const now=new Date();
  const mine=inspections.filter(x=>x.name===name && x.date && x.start).sort((a,b)=>dateTime(a)-dateTime(b));
  const future=mine.filter(x=>dateTime(x)>=now);
  $("dashboard").classList.toggle("hidden",!name);
  if(!name)return;
  const next=future[0];
  if(!next){
    $("nextDate").textContent="Ingen kommende inspeksjon";
    $("nextTime").textContent="—";$("nextArea").textContent="Planen er oppdatert?";
    $("countdown").textContent=mine.length?"Du har ingen flere inspeksjoner i den innlagte planen.":"Det er ikke registrert inspeksjoner for deg ennå.";
  }else{
    const dt=dateTime(next);
    $("nextDate").textContent=dt.toLocaleDateString("no-NO",{weekday:"long",day:"numeric",month:"long"});
    $("nextTime").textContent=`${next.start}–${next.end || "?"}`;
    $("nextArea").textContent=next.area || "Område ikke oppgitt";
    const mins=Math.max(0,Math.round((dt-now)/60000));
    $("countdown").textContent=mins<1?"Inspeksjonen starter nå":mins<60?`Starter om ${mins} min`:`Starter om ${Math.floor(mins/60)} t ${mins%60} min`;
  }
  renderWeek(name);
  $("scheduleList").innerHTML=future.slice(0,8).map(x=>`<div class="schedule-item"><div class="schedule-date">${dateTime(x).toLocaleDateString("no-NO",{weekday:"short",day:"numeric",month:"short"})}</div><div><div class="schedule-time">${esc(x.start)}–${esc(x.end||"")} · ${esc(x.name)}</div><div class="schedule-area">${esc(x.area||"Område ikke oppgitt")}</div></div></div>`).join("") || '<p class="hint">Ingen kommende inspeksjoner.</p>';
}
$("prevWeek").addEventListener("click",()=>{weekOffset--;render();});
$("nextWeek").addEventListener("click",()=>{weekOffset++;render();});
$("currentWeek").addEventListener("click",()=>{weekOffset=0;render();});
$("personSelect").addEventListener("change",render);
$("favoriteBtn").addEventListener("click",()=>{
  favorite=$("personSelect").value;
  if(!favorite){$("saveStatus").textContent="Velg et navn først.";return;}
  localStorage.setItem("iv-favorite",favorite);$("favoriteBtn").textContent="★";$("saveStatus").textContent=`${favorite} er lagret som favoritt.`;
});
$("addRowBtn").addEventListener("click",()=>{inspections.push({date:"",start:"",end:"",name:$("personSelect").value||"",area:""});renderRows();refreshNames();});
$("saveBtn").addEventListener("click",saveLocal);
$("clearTextBtn").addEventListener("click",()=>{$("extractedText").value="";});
$("pdfInput").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  $("fileStatus").textContent=`Laster ${file.name} …`;
  $("extractArea").classList.remove("hidden");
  try{
    const lib=await loadPdfJs();
    if(!lib)throw new Error("PDF-leseren kunne ikke lastes. Sjekk internettilkoblingen.");
    const bytes=await file.arrayBuffer();
    const pdf=await lib.getDocument({data:bytes}).promise;
    let text="";
    for(let p=1;p<=pdf.numPages;p++){
      const page=await pdf.getPage(p),content=await page.getTextContent();
      text+=content.items.map(it=>it.str).join(" ")+"\\n";
    }
    $("extractedText").value=text;
    $("fileStatus").textContent=`${file.name} – ${pdf.numPages} side(r) lest. Kontroller teksten under.`;
  }catch(err){$("fileStatus").textContent=err.message||"Kunne ikke lese PDF-en. Du kan legge inn inspeksjonene manuelt."; }
});
$("parseBtn").addEventListener("click",()=>{
  const raw=$("extractedText").value.trim();
  if(!raw){$("saveStatus").textContent="Fant ingen tekst å behandle.";return;}
  // General first-pass parser: lines resembling date/time/name/area are suggested.
  // PDF layouts vary; all generated rows remain editable.
  const lines=raw.split(/\n/).map(s=>s.trim()).filter(Boolean);
  const found=[];
  const dateRe=/(\d{4}-\d{2}-\d{2}|\d{1,2}[./]\d{1,2}[./]\d{2,4})/;
  const timeRe=/(\d{1,2}[:.]\d{2})/g;
  for(const line of lines){
    const d=line.match(dateRe),ts=[...line.matchAll(timeRe)];
    if(!d||ts.length<1)continue;
    let date=d[1],m;
    if(/^\d{1,2}[./]/.test(date)){
      const parts=date.split(/[./]/);let year=parts[2];if(year.length===2)year="20"+year;
      date=`${year}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
    }
    const start=ts[0][1].replace(".",":").padStart(5,"0");
    const end=ts[1]?.[1]?.replace(".",":").padStart(5,"0")||"";
    let remainder=line.replace(d[1],"").replace(timeRe,"").replace(/[|,;–—-]+/g," ").trim();
    const parts=remainder.split(/\s{2,}/).filter(Boolean);
    const name=parts[0]||"";
    const area=parts.slice(1).join(" ")||remainder.replace(name,"").trim();
    found.push({date,start,end,name,area});
  }
  if(found.length){inspections=found;renderRows();refreshNames();render();$("saveStatus").textContent=`Fant ${found.length} mulige rad(er). Kontroller navn, dato og område før du lagrer.`;}
  else $("saveStatus").textContent="Fant ikke en sikker struktur i PDF-teksten. Legg inn vaktene manuelt i tabellen.";
});
$("exportBtn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({version:"1.0.0",inspections},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="inspeksjonsplan.json";a.click();URL.revokeObjectURL(a.href);
});
$("jsonInput").addEventListener("change",async e=>{
  const f=e.target.files[0];if(!f)return;
  try{const data=JSON.parse(await f.text());inspections=Array.isArray(data)?data:data.inspections||[];renderRows();refreshNames();render();$("saveStatus").textContent="Plan importert. Trykk «Lagre inspeksjonsplan» for å lagre lokalt.";}
  catch(err){$("saveStatus").textContent="Kunne ikke importere JSON-filen.";}
});
try{inspections=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{inspections=[]}
renderRows();refreshNames();
if(favorite && [...new Set(inspections.map(x=>x.name))].includes(favorite))$("personSelect").value=favorite;
render();
