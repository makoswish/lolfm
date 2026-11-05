/* ===== Mehrere Wochen simulieren ===== */
let SIMRUN=null,SIMREP=null;
const SIMT={week:['1 Woche','Die nächste Woche inklusive deines Spiels.'],w4:['4 Wochen','Ungefähr ein halber Split.'],event:['Bis Turnierende','Bis der aktuelle Split oder das Turnier abgeschlossen ist.'],season:['Bis Saisonende','Alle restlichen Turniere dieser Saison.']};
function simStart(k){if(S.phase==='offseason'||LIVE)return;if(S.simStop==null)S.simStop=true;
  const U=S.teams[S.user];SIMRUN={k,n:0,step0:S.step,year0:S.year,ev0:S.ev?S.ev.name+'|'+S.ev.type:'',evn:S.ev?S.ev.name:'',mail0:S.mailId,bal0:S.fin.balance,chem0:chemOf(U),rep0:U.rep,tro0:S.trophies.length,mh0:new Set((S.mhist||[]).map(x=>x.id)),why:null};MODAL=null;S.view='home'}
function simOne(){if(S.phase==='offseason')return false;const p=userPending();
  if(p){openSeries(p);while(!seriesOver()){const s=LIVE.series;recordGame(simGame(S.teams[s.a],S.teams[s.b],gctx()))}commitSeries();LIVE=null;if(!userPending())step()}else step();return true}
function simDone(){const r=SIMRUN;if(!r)return true;if(S.phase==='offseason'){r.why=r.k==='season'?null:'Die Saison ist vorbei.';return true}
  const evk=S.ev?S.ev.name+'|'+S.ev.type:'';
  if(r.k==='week'&&r.n>=1)return true;
  if(r.k==='w4'&&r.n>=4)return true;
  if(r.k==='event'&&evk!==r.ev0)return true;
  if(S.simStop&&S.inbox.some(m=>m.id>=r.mail0&&['offer','spreq','pev'].includes(m.type)&&!m.done)){r.why='Im Postfach wartet eine Entscheidung.';return true}
  if(S.fin.balance<0&&r.bal0>=0){r.why='Das Konto ist ins Minus gerutscht.';return true}
  if(r.n>=80){r.why='Sicherheitsstopp.';return true}
  return false}
function simAdvance(){if(!SIMRUN)return true;try{if(!simOne()){simFinish();return true}SIMRUN.n++}catch(e){ERR=e.message;LIVE=null;simFinish();return true}if(simDone()){simFinish();return true}return false}
function simFinish(){const r=SIMRUN;if(!r)return;SIMRUN=null;const U=S.teams[S.user];
  const ser=(S.mhist||[]).filter(x=>!r.mh0.has(x.id)).reverse().map(x=>{const ui=x.a===S.user?0:1,o=S.teams[ui?x.a:x.b];return{label:x.label,opp:o,my:x.score[ui],th:x.score[1-ui],won:x.score[ui]>x.score[1-ui]}});
  const dec=S.inbox.filter(m=>m.id>=r.mail0&&['offer','spreq','pev'].includes(m.type)&&!m.done).length;
  SIMREP={weeks:r.n,from:`${r.year0} · ${r.evn}`,to:shortLabel(),ser,bal:S.fin.balance-r.bal0,chem:[r.chem0,chemOf(U)],rep:[r.rep0,U.rep],tro:S.trophies.slice(r.tro0),why:r.why,dec,mails:S.inbox.filter(m=>m.id>=r.mail0).length};
  S.view='home';save()}
function simLoop(){const t0=Date.now();while(SIMRUN&&Date.now()-t0<90){if(simAdvance())break}render();if(SIMRUN)setTimeout(simLoop,15)}
function simMenu(){const pend=userPending(),opp=pend?S.teams[pend.a===S.user?pend.b:pend.a]:null;if(S.simStop==null)S.simStop=true;
  return `<div class="ov" data-a="simclose"><div class="sheet" role="dialog" aria-label="Simulieren"><div class="lab"><span>Simulieren</span><button class="linkbtn" data-a="simclose">Schließen</button></div>
   <p class="muted" style="font-size:13.5px;margin:0 0 12px">Deine Spiele laufen ohne Draft durch, mit Aufstellung und aktiver Taktik wie eingestellt. ${opp?`Nächstes Spiel: ${opp.name} (Bo${pend.bo}).`:''}</p>
   <div class="rows">${Object.entries(SIMT).map(([k,[n,d]])=>`<button class="row simopt" data-a="simgo" data-v="${k}"><span style="min-width:0"><div class="nm">${n}</div><div class="sub">${d}</div></span><span class="dim">›</span></button>`).join('')}</div>
   <button class="tog ${S.simStop?'on':''}" data-a="simtog" style="margin-top:14px"><span class="tbox">${S.simStop?'✓':''}</span><span>Bei Angeboten und Entscheidungen anhalten</span></button></div></div>`}
function simOverlay(){const r=SIMRUN,tot=r.k==='week'?1:r.k==='w4'?4:r.k==='event'?Math.max(1,(S.ev&&S.ev.type==='split'?10:6)):52-r.step0,pc=clamp(r.n/tot*100,4,100);
  return `<div class="ov simov"><div class="sheet" role="status"><div class="lab"><span>Simulation läuft</span><span>${SIMT[r.k][0]}</span></div>
   <div style="font-family:var(--f-disp);font-size:22px;margin:4px 0 10px">${shortLabel()} · Woche ${S.step}</div><div class="sprog"><i style="width:${pc}%"></i></div>
   <div class="acts" style="margin-top:14px"><button class="btn ghost sm" data-a="simhalt">Anhalten</button></div></div></div>`}
function simReport(){const r=SIMREP,w=r.ser.filter(x=>x.won).length,l=r.ser.length-w,cd=r.chem[1]-r.chem[0];
  return `<div class="ov"><div class="sheet" role="dialog" aria-label="Simulationsbericht"><div class="lab"><span>Simulationsbericht</span><span>${r.weeks} ${r.weeks===1?'Woche':'Wochen'}</span></div>
   <p class="muted" style="font-size:13px;margin:0 0 10px">${r.from} bis ${r.to}${r.why?`<br><span class="warn">Angehalten: ${r.why}</span>`:''}</p>
   <div class="kpis"><div><span>Serien</span><b>${w}:${l}</b></div><div><span>Konto</span><b class="${r.bal<0?'bad':'good'}">${r.bal>=0?'+':''}${eurK(r.bal)}</b></div><div><span>Chemie</span><b class="${cd<0?'bad':cd>0?'good':''}">${r.chem[1]} (${cd>=0?'+':''}${cd})</b></div><div><span>Ruf</span><b>${r.rep[1]}${r.rep[1]!==r.rep[0]?` (${r.rep[1]>r.rep[0]?'+':''}${r.rep[1]-r.rep[0]})`:''}</b></div></div>
   ${r.tro.length?`<div class="note good" style="margin:10px 0">Titel gewonnen: ${r.tro.map(t=>t.name||t.n||t).join(', ')}</div>`:''}
   <div class="simser">${r.ser.map(x=>`<div class="stat"><span style="display:flex;gap:8px;align-items:center;min-width:0">${crest(x.opp,'sm')}<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x.opp.name}<small class="dim" style="display:block;font-family:var(--f-body);font-size:11.5px">${x.label}</small></span></span><span class="${x.won?'good':'bad'}">${x.my}:${x.th}</span></div>`).join('')||'<p class="empty">Keine eigenen Spiele in diesem Zeitraum.</p>'}</div>
   <div class="acts" style="margin-top:14px">${r.dec||r.mails?`<button class="btn ${r.dec?'':'ghost'} sm" data-a="simclose" data-go="inbox">Postfach${r.dec?` (${r.dec} offen)`:''}</button>`:''}<button class="btn ${r.dec?'ghost':''} sm" data-a="simclose">Weiter</button></div></div></div>`}
