/* ===== Spielstand exportieren / importieren ===== */
let EXP=null,IMPMSG=null;
function b64FromBytes(u){let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
function bytesFromB64(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
async function packSave(){const json=JSON.stringify(S);
  if(typeof CompressionStream!=='undefined'){try{const st=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));const buf=new Uint8Array(await new Response(st).arrayBuffer());return 'RIFT1:'+b64FromBytes(buf)}catch(e){}}
  return 'RIFT0:'+btoa(unescape(encodeURIComponent(json)))}
async function unpackSave(txt){txt=(txt||'').trim().replace(/\s+/g,'');if(!txt)throw new Error('Das Feld ist leer.');
  let json;
  if(txt.startsWith('RIFT1:')){if(typeof DecompressionStream==='undefined')throw new Error('Dein Browser kann diesen Spielstand nicht entpacken. Aktualisiere den Browser.');
    const st=new Blob([bytesFromB64(txt.slice(6))]).stream().pipeThrough(new DecompressionStream('gzip'));json=await new Response(st).text()}
  else if(txt.startsWith('RIFT0:'))json=decodeURIComponent(escape(atob(txt.slice(6))));
  else if(txt.startsWith('{'))json=txt;
  else throw new Error('Das sieht nicht nach einem Rift-Manager-Spielstand aus. Er beginnt mit RIFT1:');
  const o=JSON.parse(json);if(!o||!o.teams||!o.players||!o.user||!o.teams[o.user])throw new Error('Der Spielstand ist unvollständig.');return o}
function adoptSave(o){S=o;LIVE=null;MODAL=null;SIMRUN=null;SIMREP=null;if(['live','prematch','draft','nego'].includes(S.view))S.view='home';VIEWREG=S.teams[S.user].reg;migrate();if(evBroken(S.ev))restartEvent();else relink(S.ev);S.view='home';save()}
async function doImport(txt){try{const o=await unpackSave(txt);if(!S)useSlot(NEWSLOT||freeSlot()||SLOT);adoptSave(o);IMPMSG=['good',`Spielstand geladen: ${S.teams[S.user].name}, Saison ${S.year}.`]}catch(e){IMPMSG=['bad',e.message||'Import fehlgeschlagen.']}render()}
function saveKB(t){return Math.max(1,Math.round(t.length/1024)).toLocaleString('de-DE')+' KB'}
function importBox(){return `<div class="lab" style="margin-top:4px"><span>Spielstand importieren</span></div>
  <p class="muted" style="font-size:13px;margin:0 0 8px">Füge den kopierten Text ein oder wähle eine gespeicherte Textdatei. ${S?`Der Spielstand in Platz ${SLOT} wird ersetzt.`:`Er landet in Platz ${NEWSLOT||freeSlot()||SLOT}${slotInfo(NEWSLOT||freeSlot()||SLOT)?' und ersetzt den Spielstand dort':''}.`}</p>
  <textarea id="imptxt" class="savetxt" rows="4" placeholder="RIFT1:..." spellcheck="false" autocomplete="off"></textarea>
  <div class="acts" style="margin-top:8px"><button class="btn sm" data-a="impgo">Importieren</button><label class="btn ghost sm filebtn">Datei wählen<input type="file" id="impfile" accept=".txt,.json,text/plain,application/json"></label></div>
  ${IMPMSG?`<div class="note ${IMPMSG[0]}" style="margin-top:10px">${IMPMSG[1]}</div>`:''}`}
function slotWhen(t){if(!t)return'';const d=new Date(t);return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+', '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
/* Liste der drei Speicherplätze. Im Spiel: wechseln und löschen. Auf dem Startbildschirm: laden, löschen oder Platz fürs neue Spiel wählen. */
function slotList(){const pick=S?null:(NEWSLOT||freeSlot()||SLOT);
  return `<div class="slots">${Array.from({length:NSLOTS},(_,i)=>i+1).map(n=>{const m=slotInfo(n),cur=S&&n===SLOT;
   const info=m?`${crest({id:m.id||"?",color:m.color},"sm")}<span class="slmain"><b>${esc(m.team)}</b><small class="muted">${esc(m.mgr||'')} · Saison ${m.year}, Woche ${Math.min(52,m.step||0)}/52 · ${slotWhen(m.when)}</small></span>`
    :`<span class="slnum">${n}</span><span class="slmain"><b class="dim">Leer</b><small class="muted">Platz ${n}</small></span>`;
   let acts='';
   if(cur)acts=`<span class="dtag st">Aktiv</span>`;
   else if(m)acts=`<button class="btn ghost sm" data-a="slotload" data-v="${n}" ${LIVE?'disabled':''}>Laden</button><button class="btn danger sm" data-a="slotdel" data-v="${n}">Löschen</button>`;
   if(!S)acts+=`<button class="btn ${pick===n?'':'ghost'} sm" data-a="slotpick" data-v="${n}">${pick===n?'Neues Spiel hier':'Hier neu starten'}</button>`;
   return `<div class="slot ${cur||pick===n?'on':''}">${info}<span class="slacts">${acts}</span></div>`}).join('')}</div>
  ${!S&&slotInfo(pick)?`<p class="warn" style="font-size:13px;margin:8px 0 0">Ein neues Spiel überschreibt den Spielstand in Platz ${pick}.</p>`:''}`}
function saveView(){const sz=(()=>{try{return saveKB(localStorage.getItem(SAVEKEY)||'')}catch(e){return '?'}})();
  return `<div class="pagehead"><div><h1>Spielstand</h1><p>${S.teams[S.user].name} · Saison ${S.year} · ${S.manager}</p></div></div>
  <div class="grid"><section class="panel s12"><div class="lab"><span>Speicherplätze</span><span>Platz ${SLOT} ist aktiv</span></div>${slotList()}
   <div class="acts" style="margin-top:12px"><button class="btn ghost sm" data-a="mainmenu" ${LIVE?'disabled':''}>Zum Hauptmenü</button>${LIVE?'<span class="muted" style="font-size:13px">Erst die laufende Serie beenden.</span>':''}</div></section>
  <section class="panel s7"><div class="lab"><span>Exportieren</span><span>im Browser: ${sz}</span></div>
   <p class="muted" style="font-size:13px;margin:0 0 10px">Der Spielstand liegt nur in diesem Browser. Mit dem Export nimmst du ihn auf ein anderes Gerät oder in eine neue Version des Spiels mit: kopieren, irgendwo speichern (Notizen, Mail an dich selbst) und dort wieder importieren.</p>
   ${EXP?(EXP.err?`<div class="note bad">${EXP.err}</div>`:`<textarea id="exptxt" class="savetxt" rows="4" readonly spellcheck="false">${EXP.txt}</textarea>
    <div class="acts" style="margin-top:8px"><button class="btn sm" data-a="expcopy">Kopieren (${saveKB(EXP.txt)})</button><button class="btn ghost sm" data-a="expmake">Neu erzeugen</button></div>
    ${EXP.msg?`<div class="note ${EXP.msg[0]}" style="margin-top:10px">${EXP.msg[1]}</div>`:''}<p class="dim" style="font-size:12px;margin:8px 0 0">Stand: ${EXP.when}</p>`)
   :`<button class="btn sm" data-a="expmake">Export erzeugen</button>`}</section>
   <section class="panel s5">${importBox()}</section></div>`}
