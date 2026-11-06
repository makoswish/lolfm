/* ===== Seiten: Manager (Vorstand, Karriere, Kündigung), Medizin, Meta, Liga-Lage, Darstellung ===== */
let MTAB='board';

/* ----- Manager-Gruppe: alle Seiten über dich als Manager mit gemeinsamer Reiterleiste ----- */
function mgrTabs(){return groupTabs()}
function mgrView(){
  const head=`<div class="pagehead"><div><h1>${MTAB==='career'?'Karriere':'Vorstand'}</h1><p>${S.manager} · ${mgrTier()} · Ruf ${S.mrep==null?30:S.mrep} · ${S.teams[S.user].name}</p></div></div>${mgrTabs()}`;
  if(MTAB==='career')return head+`<div class="grid">${careerPanel()||'<section class="panel s12"><p class="empty">Noch keine abgeschlossene Saison.</p></section>'}${mgrPanel()}</div>`;
  return head+`<div class="grid">${goalsPanel()}${resignPanel()}${mgrPanel()}</div>`}

/* ----- Kündigung: zum Saisonende vormerken, in der Pause sofort ----- */
function resignWhy(){if(S.jobless)return 'Du bist bereits ohne Verein.';if(LIVE||SIMRUN)return 'Nicht während eines Spiels.';return null}
/* Freie Wahl nach der Kündigung: bis zu acht Vereine aus allen Regionen, so groß, wie dein Ruf als Manager es erlaubt. */
function resignJobs(){const U=S.teams[S.user],top=U.rep+6+Math.round((S.mrep==null?30:S.mrep)/5);
  const all=Object.values(S.teams).filter(t=>t.tier!==2&&!t.academy&&t.id!==S.user&&t.rep<=top);
  const other=shuffle(all.filter(t=>t.reg!==U.reg)),same=shuffle(all.filter(t=>t.reg===U.reg));
  const pickN=(a,n)=>a.slice(0,n);let L=[...pickN(other,5),...pickN(same,3)];
  if(L.length<4)L=[...L,...pickN(shuffle(Object.values(S.teams).filter(t=>t.tier!==2&&!t.academy&&t.id!==S.user&&!L.includes(t))),4-L.length)];
  return L.sort((a,b)=>b.rep-a.rep).map(t=>t.id)}
function resignDo(){S.mrep=clamp((S.mrep==null?30:S.mrep)-3,0,100);S.resign=false;S.jobless=true;S.jobs={list:resignJobs(),sacked:true,resigned:true};
  mail('Kündigung wirksam',`Du hast bei ${S.teams[S.user].name} gekündigt. Es liegen ${S.jobs.list.length} Angebote vor. Such dir einen Verein aus, bevor die neue Saison startet. Dein Manager-Ruf sinkt um 3.`,{type:'job'});
  news(`${S.teams[S.user].name} und ${S.manager} gehen getrennte Wege. Der Manager hat gekündigt.`,'liga')}
function resignAsk(){const e=resignWhy();if(e)return e;
  if(S.phase==='offseason'){resignDo();S.view='jobs';return null}
  S.resign=true;mail('Kündigung eingereicht',`Du kündigst zum Saisonende. Bis dahin führst du ${S.teams[S.user].name} normal weiter. Danach wählst du einen neuen Verein.`);return null}
function resignPanel(){const off=S.phase==='offseason';
  return `<section class="panel s6"><div class="lab"><span>Kündigung</span><span>${S.resign?'<span class="warn">vorgemerkt</span>':'Verein verlassen'}</span></div>
  <p class="muted" style="font-size:13.5px;margin:0 0 10px">${S.resign?'Du verlässt den Verein zum Saisonende. Bis dahin ändert sich nichts.':off?'In der Saisonpause wirkt die Kündigung sofort. Du bekommst Angebote aus allen Regionen und wählst einen neuen Verein.':'Eine Kündigung wirkt zum Saisonende. Mitten in der Saison bleibst du im Amt, danach wählst du einen neuen Verein aus allen Regionen.'}
  Der Manager-Ruf sinkt um 3. Trainerstab, Scouts, Finanzen und Academy bleiben beim alten Verein.</p>
  <div class="acts">${S.resign?`<button class="btn ghost sm" data-a="resign" data-v="off">Kündigung zurückziehen</button>`:`<button class="btn danger sm" data-a="resign" ${resignWhy()?'disabled':''}>${off?'Jetzt kündigen':'Zum Saisonende kündigen'}</button>`}</div>${resignWhy()&&!S.jobless?`<p class="muted" style="font-size:13px;margin:8px 0 0">${resignWhy()}</p>`:''}</section>`}

/* ----- Team: Medizin ----- */
function medTab(){const U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]).filter(Boolean).sort((a,b)=>(isOut(b)-isOut(a))||((b.load||0)-(a.load||0)));
  const out=ps.filter(isOut),risk=ps.reduce((a,p)=>a+(isOut(p)?0:injChance(p)),0),avg=ps.reduce((a,p)=>a+(p.load||0),0)/Math.max(1,ps.length);
  const st=p=>isOut(p)?`<span class="bad">${p.out.why==='Verletzung'?p.out.kind||'Verletzung':p.out.why}</span> <span class="dim">bis Woche ${p.out.until}</span>`:(p.load||0)>=75?'<span class="warn">überlastet</span>':'<span class="good">fit</span>';
  return `<section class="s12 tiles" style="grid-template-columns:repeat(3,minmax(0,1fr))">
   <div class="tile"><span>Ausfälle</span><b class="${out.length?'bad':'good'}">${out.length}</b></div>
   <div class="tile"><span>Ø Belastung</span><b class="${avg>=70?'warn':''}">${Math.round(avg)}</b></div>
   <div class="tile"><span>Verletzungsrisiko pro Woche</span><b>${Math.round(risk*100)}%</b></div></section>
  <section class="panel s12"><div class="lab"><span>Kader</span><span>nach Belastung</span></div><div class="scroll"><table class="tbl"><thead><tr><th>Rolle</th><th>Spieler</th><th>Status</th><th class="r">Belastung</th><th class="r">Form</th><th class="r">Risiko</th><th></th></tr></thead><tbody>
   ${ps.map(p=>`<tr class="click" data-a="player" data-id="${p.id}" tabindex="0"><td><span class="chip">${p.role}</span></td><td class="nmcell">${p.name}</td><td>${st(p)}</td><td class="r mono" style="color:${barCol(100-(p.load||0))}">${Math.round(p.load||0)}</td><td class="r mono" style="color:${barCol(p.form)}">${Math.round(p.form)}</td><td class="r mono">${isOut(p)?'-':(injChance(p)*100).toFixed(1)+'%'}</td>
    <td class="r">${isOut(p)?rehaBtn(p):`<button class="btn ghost sm" data-a="rest" data-id="${p.id}">Pause</button>`}</td></tr>`).join('')}</tbody></table></div>
   <p class="muted" style="font-size:13px;margin:10px 0 0">Die Verletzungswahrscheinlichkeit steigt mit der Belastung und sinkt mit Ausdauer. Eine Pause baut Belastung ab, ein Reha-Programm verkürzt eine Verletzung um eine Woche.</p></section>`}

/* ----- Wettbewerb: Meta und Liga-Lage ----- */
function metaLog(t){S.mlog=S.mlog||[];S.mlog.unshift({t,when:shortLabel()});if(S.mlog.length>10)S.mlog.length=10}
function metaTab(){const m=S.mst;
  return `<section class="panel s12"><div class="lab"><span>Patch ${S.year-2000}.${S.patch||1}</span><span>★ im Draft = Bonus</span></div>${metaNote()}
   <div class="metagrid">${ROLES.map(r=>`<div><div class="lab" style="margin-bottom:4px">${RN[r]}${m&&m.role===r?' <span class="good" style="font-size:12px">Rollen-Meta</span>':''}</div>${CHR[r].filter(isMeta).map(c=>`<div style="font-size:14px">${CH[c][0]} <span class="dim" style="font-size:12px">${CH[c][6]}</span></div>`).join('')||'<span class="dim">-</span>'}</div>`).join('')}</div></section>
  <section class="panel s6"><div class="lab">Stile im Vergleich</div>${SK.map(k=>{const n=teamsOf(S.teams[S.user].reg).filter(t=>t.style===k).length;return `<div class="stat"><span>${STYLES[k].n}${m&&m.style===k?' <span class="good" style="font-size:12px">Meta</span>':''}</span><span>${n} von ${teamsOf(S.teams[S.user].reg).length} Teams in ${S.teams[S.user].reg}</span></div>`}).join('')}
   <p class="muted" style="font-size:13px;margin:10px 0 0">Der Stil im Meta gibt +1 Teamstärke je Phase. Mitten im Split verändert ein Hotfix das Meta.</p></section>
  <section class="panel s6"><div class="lab">Patch-Verlauf</div>${(S.mlog||[]).map(x=>`<div class="stat"><span>${x.t}</span><span class="dim">${x.when}</span></div>`).join('')||'<p class="empty">Noch kein Hotfix.</p>'}</section>`}
function lageTab(){const reg=S.teams[S.user].reg,L=teamsOf(reg).filter(t=>t.starters&&ROLES.every(r=>S.players[t.starters[r]])).map(t=>[t,ROLES.reduce((a,r)=>a+S.players[t.starters[r]].form,0)/5]).sort((a,b)=>b[1]-a[1]);
  const row=([t,f],i)=>`<button class="lbrow" data-a="team" data-id="${t.id}"><span class="pos">${i+1}</span>${crest(t,'sm')}<span class="nmcell">${t.name}<small class="dim"> ${STYLES[t.style].n}</small></span><b class="mono" style="color:${barCol(f)}">${Math.round(f)}</b></button>`;
  return `<section class="panel s6"><div class="lab"><span>Formstärkste Teams ${reg}</span><span>Ø Form der Startelf</span></div>${L.slice(0,5).map(row).join('')}</section>
  <section class="panel s6"><div class="lab"><span>Formschwächste Teams ${reg}</span><span>Ø Form der Startelf</span></div>${L.slice(-5).reverse().map((x,i)=>row(x,L.length-1-i)).join('')}</section>
  <section class="panel s12"><div class="lab"><span>Meldungen aus der Liga</span><span>${(S.news||[]).filter(n=>n.cat==='liga').length}</span></div>${(S.news||[]).filter(n=>n.cat==='liga').slice(0,12).map(n=>`<div class="stat"><span>${n.t}</span><span class="dim">${n.when}</span></div>`).join('')||'<p class="empty">Noch keine Meldungen.</p>'}</section>`}

/* ----- Darstellung: Skalierung automatisch nach Bildschirmbreite oder fest gewählt ----- */
const UISC=[['auto','Automatisch'],['0.9','90 %'],['1','100 %'],['1.15','115 %'],['1.3','130 %'],['1.5','150 %']];
function uiPref(){try{return localStorage.getItem('riftmgr_ui')||'auto'}catch(e){return 'auto'}}
function uiAuto(w){return w<900?1:w>=2800?1.5:w>=2200?1.3:w>=1700?1.15:1}
function uiScale(){const p=uiPref(),w=typeof window!=='undefined'?(window.innerWidth||1200):1200;if(p==='auto')return uiAuto(w);const v=+p;return w<900?Math.min(v,1.15):v}
function applyScale(){try{const z=uiScale();if(typeof document!=='undefined'&&document.body)document.body.style.zoom=z===1?'':String(z)}catch(e){}}
function setUiScale(v){try{localStorage.setItem('riftmgr_ui',v)}catch(e){}applyScale()}
function uiPanel(){const p=uiPref();return `<section class="panel s12"><div class="lab"><span>Darstellung</span><span>Skalierung ${Math.round(uiScale()*100)} %</span></div>
  <div class="seg">${UISC.map(([v,l])=>`<button class="${p===v?'on':''}" data-a="uisc" data-v="${v}">${l}</button>`).join('')}</div>
  <p class="muted" style="font-size:13px;margin:10px 0 0">Automatisch wächst die Oberfläche mit dem Bildschirm: ab 1700 px Breite 115 %, ab 2200 px 130 %, ab 2800 px 150 %. Am Handy bleibt sie bei 100 %. Mit einer festen Stufe lässt sie sich selbst bestimmen.</p></section>`}
function maintPanel(){return `<section class="panel s12"><div class="lab">Wartung</div>
  <p class="muted" style="font-size:13px;margin:0 0 8px">Hängt ein Turnier fest, startet "Phase neu starten" die aktuelle Turnierphase neu. Bisherige Ergebnisse bleiben.</p>
  <div class="acts"><button class="btn ghost sm" data-a="repair">Phase neu starten</button>${MODAL==='reset'?`<button class="btn danger sm" data-a="reset" data-ok="1">Ja, alles löschen</button><button class="btn ghost sm" data-a="reset" data-ok="0">Abbrechen</button>`:`<button class="btn ghost sm" data-a="reset">Neue Karriere</button>`}</div></section>`}
if(typeof window!=='undefined'&&window.addEventListener){window.addEventListener('resize',()=>{try{applyScale()}catch(e){}});window.addEventListener('load',()=>applyScale())}

/* Handy: Die Leiste unten scrollt waagerecht, die aktive Gruppe bleibt sichtbar. */
function navScroll(){if(typeof document==='undefined'||typeof window==='undefined'||window.innerWidth>=900)return;const side=document.querySelector('.side'),on=side&&side.querySelector('.ngrp.open');
  if(side&&on)side.scrollLeft=Math.max(0,on.offsetLeft-(side.clientWidth-on.offsetWidth)/2)}
